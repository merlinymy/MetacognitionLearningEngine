import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { getSessions, getSessionResponses } from "../services/api";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        // Get all sessions for the logged-in user
        const userId = user?._id || "anonymous";
        const sessionsData = await getSessions(userId, 100, 0);
        const allSessions = sessionsData.sessions || [];

        // Calculate aggregate statistics across all sessions
        const completedSessions = allSessions.filter((s) => s.status === "completed");

        if (completedSessions.length === 0) {
          setStats({
            totalSessions: allSessions.length,
            completedSessions: 0,
            totalChunks: 0,
            averageAccuracy: 0,
            averageConfidence: 0,
            totalTimeMinutes: 0,
            strategyStats: [],
            recentSessions: allSessions.slice(0, 5),
          });
          setLoading(false);
          return;
        }

        // Aggregate stats from all completed sessions
        let totalChunks = 0;
        let totalAccuracy = 0;
        let totalConfidence = 0;
        let totalTime = 0;
        const strategyMap = {};

        completedSessions.forEach((session) => {
          if (session.sessionStats) {
            totalChunks += session.sessionStats.chunksCompleted || 0;
            totalAccuracy += (session.sessionStats.averageAccuracy || 0) * (session.sessionStats.chunksCompleted || 0);
            totalConfidence += (session.sessionStats.averageConfidence || 0) * (session.sessionStats.chunksCompleted || 0);
            totalTime += session.sessionStats.totalTimeSeconds || 0;
          }
        });

        // Fetch all responses to calculate strategy performance
        const allResponses = [];
        for (const session of completedSessions) {
          try {
            const responsesData = await getSessionResponses(session._id);
            allResponses.push(...(responsesData.responses || []));
          } catch (err) {
            console.error("Failed to fetch responses for session:", session._id);
          }
        }

        // Calculate strategy performance, trends, goal achievement, and strategy-goal matrix
        const trendData = [];
        const goalMap = {};
        const strategyGoalMatrix = {}; // strategy -> goal -> stats
        const planExecutionMap = {}; // next time adjustment -> execution tracking
        const timeEfficiencyData = []; // track time spent vs accuracy
        const muddyPoints = []; // collect all muddy points for pattern detection

        allResponses.forEach((response, index) => {
          const strategyName = response.strategy || "Unknown";
          if (!strategyMap[strategyName]) {
            strategyMap[strategyName] = { totalAccuracy: 0, count: 0, helpful: 0, notHelpful: 0 };
          }
          strategyMap[strategyName].totalAccuracy += response.accuracy || 0;
          strategyMap[strategyName].count += 1;

          if (response.strategyHelpful === true) {
            strategyMap[strategyName].helpful += 1;
          } else if (response.strategyHelpful === false) {
            strategyMap[strategyName].notHelpful += 1;
          }

          // Track trend data for each response
          trendData.push({
            date: new Date(response.createdAt),
            accuracy: response.accuracy || 0,
            confidence: response.confidence || 0,
            calibrationError: Math.abs((response.confidence || 0) - (response.accuracy || 0)),
          });

          // Track goal achievement by goal type
          const goalType = response.goal || "Unknown";
          if (!goalMap[goalType]) {
            goalMap[goalType] = { achieved: 0, notAchieved: 0, totalAccuracy: 0, count: 0 };
          }
          goalMap[goalType].count += 1;
          goalMap[goalType].totalAccuracy += response.accuracy || 0;
          if (response.goalAchieved === true) {
            goalMap[goalType].achieved += 1;
          } else if (response.goalAchieved === false) {
            goalMap[goalType].notAchieved += 1;
          }

          // Track strategy-goal combinations
          if (!strategyGoalMatrix[strategyName]) {
            strategyGoalMatrix[strategyName] = {};
          }
          if (!strategyGoalMatrix[strategyName][goalType]) {
            strategyGoalMatrix[strategyName][goalType] = { totalAccuracy: 0, count: 0 };
          }
          strategyGoalMatrix[strategyName][goalType].totalAccuracy += response.accuracy || 0;
          strategyGoalMatrix[strategyName][goalType].count += 1;

          // Track plan execution: what did they plan to do next time?
          if (response.nextTimeAdjustment && response.nextTimeAdjustment.trim()) {
            const plan = response.nextTimeAdjustment.trim().toLowerCase();
            if (!planExecutionMap[plan]) {
              planExecutionMap[plan] = {
                planCount: 0,
                executedCount: 0,
                lastPlannedIndex: -1,
                examples: []
              };
            }
            planExecutionMap[plan].planCount += 1;
            planExecutionMap[plan].lastPlannedIndex = index;
            if (planExecutionMap[plan].examples.length < 1) {
              planExecutionMap[plan].examples.push(response.nextTimeAdjustment.trim());
            }

            // Check if there's a next response to see if they executed it
            const nextResponse = allResponses[index + 1];
            if (nextResponse) {
              const strategyChanged = nextResponse.strategy !== response.strategy;

              // If plan was about changing strategy and they did change, count as executed
              if (plan.includes("different") || plan.includes("try") || plan.includes("switch")) {
                if (strategyChanged) {
                  planExecutionMap[plan].executedCount += 1;
                }
              } else if (plan.includes("same") || plan.includes("keep") || plan.includes("continue")) {
                // If plan was to keep same and they did, count as executed
                if (!strategyChanged) {
                  planExecutionMap[plan].executedCount += 1;
                }
              }
            }
          }

          // Track time efficiency (time spent vs accuracy)
          if (response.timeSpent) {
            timeEfficiencyData.push({
              timeSpent: response.timeSpent, // in seconds
              accuracy: response.accuracy || 0,
              strategy: strategyName,
            });
          }

          // Collect muddy points for pattern detection
          if (response.muddyPoint && response.muddyPoint.trim()) {
            muddyPoints.push({
              text: response.muddyPoint.trim(),
              accuracy: response.accuracy || 0,
              strategy: strategyName,
            });
          }
        });

        // Sort trend data by date
        trendData.sort((a, b) => a.date - b.date);

        // Group responses into weekly buckets for trend analysis
        const weeklyTrends = [];
        if (trendData.length > 0) {
          const firstDate = trendData[0].date;
          const weekBuckets = {};

          trendData.forEach((item) => {
            const weeksSinceStart = Math.floor((item.date - firstDate) / (7 * 24 * 60 * 60 * 1000));
            if (!weekBuckets[weeksSinceStart]) {
              weekBuckets[weeksSinceStart] = {
                accuracies: [],
                confidences: [],
                calibrationErrors: [],
                weekNumber: weeksSinceStart,
              };
            }
            weekBuckets[weeksSinceStart].accuracies.push(item.accuracy);
            weekBuckets[weeksSinceStart].confidences.push(item.confidence);
            weekBuckets[weeksSinceStart].calibrationErrors.push(item.calibrationError);
          });

          // Calculate averages for each week
          Object.values(weekBuckets).forEach((bucket) => {
            const avgAccuracy = bucket.accuracies.reduce((sum, val) => sum + val, 0) / bucket.accuracies.length;
            const avgConfidence = bucket.confidences.reduce((sum, val) => sum + val, 0) / bucket.confidences.length;
            const avgCalibrationError = bucket.calibrationErrors.reduce((sum, val) => sum + val, 0) / bucket.calibrationErrors.length;

            weeklyTrends.push({
              week: bucket.weekNumber + 1,
              accuracy: Math.round(avgAccuracy),
              confidence: Math.round(avgConfidence),
              calibrationError: Math.round(avgCalibrationError),
            });
          });

          weeklyTrends.sort((a, b) => a.week - b.week);
        }

        // Calculate goal achievement stats
        const goalStats = Object.entries(goalMap)
          .map(([goal, data]) => ({
            goal,
            achievementRate: data.achieved + data.notAchieved > 0
              ? Math.round((data.achieved / (data.achieved + data.notAchieved)) * 100)
              : null,
            averageAccuracy: Math.round(data.totalAccuracy / data.count),
            attempts: data.count,
          }))
          .filter((item) => item.achievementRate !== null)
          .sort((a, b) => b.achievementRate - a.achievementRate);

        const strategyStats = Object.entries(strategyMap)
          .map(([strategy, data]) => ({
            strategy,
            averageAccuracy: Math.round(data.totalAccuracy / data.count),
            uses: data.count,
            helpfulPercentage: data.helpful + data.notHelpful > 0
              ? Math.round((data.helpful / (data.helpful + data.notHelpful)) * 100)
              : null,
          }))
          .sort((a, b) => b.averageAccuracy - a.averageAccuracy);

        // Generate contextual strategy insights
        const strategyGoalInsights = [];
        Object.entries(strategyGoalMatrix).forEach(([strategy, goals]) => {
          const goalPerformances = Object.entries(goals)
            .map(([goal, data]) => ({
              goal,
              accuracy: Math.round(data.totalAccuracy / data.count),
              uses: data.count,
            }))
            .filter((item) => item.uses >= 2) // Only include goals with at least 2 uses
            .sort((a, b) => b.accuracy - a.accuracy);

          if (goalPerformances.length >= 2) {
            const best = goalPerformances[0];
            const worst = goalPerformances[goalPerformances.length - 1];
            const diff = best.accuracy - worst.accuracy;

            if (diff >= 15) {
              strategyGoalInsights.push({
                strategy,
                bestGoal: best.goal,
                bestAccuracy: best.accuracy,
                worstGoal: worst.goal,
                worstAccuracy: worst.accuracy,
                difference: diff,
                goalPerformances,
              });
            }
          }
        });

        // Sort insights by difference (most significant first)
        strategyGoalInsights.sort((a, b) => b.difference - a.difference);

        // Generate reflection pattern insights
        const reflectionPatterns = Object.entries(planExecutionMap)
          .filter(([, data]) => data.planCount >= 2) // Only show patterns that happened 2+ times
          .map(([, data]) => ({
            plan: data.examples[0], // Use original casing
            count: data.planCount,
            executedCount: data.executedCount,
            executionRate: data.planCount > 0 ? Math.round((data.executedCount / data.planCount) * 100) : 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 patterns

        // Analyze time efficiency
        let efficiencyInsight = null;
        if (timeEfficiencyData.length >= 5) {
          // Sort by time spent
          const sortedByTime = [...timeEfficiencyData].sort((a, b) => a.timeSpent - b.timeSpent);

          // Split into quartiles
          const quartileSize = Math.floor(sortedByTime.length / 4);
          const q1 = sortedByTime.slice(0, quartileSize); // Fastest
          const q4 = sortedByTime.slice(-quartileSize); // Slowest

          // Calculate average accuracy for each quartile
          const q1AvgAccuracy = Math.round(q1.reduce((sum, d) => sum + d.accuracy, 0) / q1.length);
          const q4AvgAccuracy = Math.round(q4.reduce((sum, d) => sum + d.accuracy, 0) / q4.length);

          // Calculate average time (in seconds)
          const q1AvgTime = Math.round(q1.reduce((sum, d) => sum + d.timeSpent, 0) / q1.length);
          const q4AvgTime = Math.round(q4.reduce((sum, d) => sum + d.timeSpent, 0) / q4.length);

          const accuracyGain = q4AvgAccuracy - q1AvgAccuracy;
          const timeMultiplier = q4AvgTime / q1AvgTime;

          efficiencyInsight = {
            fastAvgTime: q1AvgTime,
            fastAvgAccuracy: q1AvgAccuracy,
            slowAvgTime: q4AvgTime,
            slowAvgAccuracy: q4AvgAccuracy,
            accuracyGain,
            timeMultiplier: Math.round(timeMultiplier * 10) / 10,
            efficiency: accuracyGain / timeMultiplier, // accuracy gain per time multiplier
          };
        }

        // Analyze muddy points for common themes
        let muddyPointInsights = null;
        if (muddyPoints.length >= 3) {
          // Simple keyword-based pattern detection
          const commonKeywords = [
            { keywords: ['abstract', 'theoretical', 'concept'], theme: 'Abstract concepts' },
            { keywords: ['formula', 'equation', 'math', 'calculation'], theme: 'Mathematical formulas' },
            { keywords: ['terminology', 'term', 'definition', 'vocabulary'], theme: 'Terminology' },
            { keywords: ['connection', 'relationship', 'how', 'why'], theme: 'Connections and relationships' },
            { keywords: ['application', 'apply', 'use', 'practical'], theme: 'Practical applications' },
            { keywords: ['detail', 'specific', 'example'], theme: 'Specific details' },
          ];

          const themeMatches = {};
          muddyPoints.forEach((mp) => {
            const lowerText = mp.text.toLowerCase();
            commonKeywords.forEach(({ keywords, theme }) => {
              if (keywords.some(kw => lowerText.includes(kw))) {
                if (!themeMatches[theme]) {
                  themeMatches[theme] = { count: 0, examples: [], totalAccuracy: 0 };
                }
                themeMatches[theme].count += 1;
                themeMatches[theme].totalAccuracy += mp.accuracy;
                if (themeMatches[theme].examples.length < 2) {
                  themeMatches[theme].examples.push(mp.text);
                }
              }
            });
          });

          const topThemes = Object.entries(themeMatches)
            .filter(([, data]) => data.count >= 2) // At least 2 occurrences
            .map(([theme, data]) => ({
              theme,
              count: data.count,
              avgAccuracy: Math.round(data.totalAccuracy / data.count),
              examples: data.examples,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3 themes

          if (topThemes.length > 0) {
            muddyPointInsights = {
              totalMuddyPoints: muddyPoints.length,
              themes: topThemes,
            };
          }
        }

        setStats({
          totalSessions: allSessions.length,
          completedSessions: completedSessions.length,
          totalChunks,
          averageAccuracy: totalChunks > 0 ? Math.round(totalAccuracy / totalChunks) : 0,
          averageConfidence: totalChunks > 0 ? Math.round(totalConfidence / totalChunks) : 0,
          totalTimeMinutes: Math.round(totalTime / 60),
          strategyStats,
          recentSessions: allSessions.slice(0, 5),
          weeklyTrends,
          goalStats,
          strategyGoalInsights,
          reflectionPatterns,
          efficiencyInsight,
          muddyPointInsights,
        });

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <p className="dashboard-loading">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="dashboard-error">{error}</div>
          <Button onClick={() => navigate("/")}>Back to home</Button>
        </div>
      </div>
    );
  }

  const hasData = stats && stats.completedSessions > 0;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Your learning dashboard</h1>
          <p className="dashboard-subtitle">
            Track your progress and improve your metacognitive skills
          </p>
        </div>

        {!hasData && (
          <Card>
            <div className="dashboard-empty">
              <p className="dashboard-empty-text">
                No completed sessions yet. Start learning to see your progress!
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/upload")}
                style={{ marginTop: "16px" }}
              >
                Start learning
              </Button>
            </div>
          </Card>
        )}

        {hasData && (
          <>
            {/* Overall Statistics */}
            <div className="dashboard-stats">
              <Card>
                <div className="dashboard-stat">
                  <div className="dashboard-stat-value">
                    {stats.completedSessions}
                  </div>
                  <div className="dashboard-stat-label">Completed sessions</div>
                </div>
              </Card>

              <Card>
                <div className="dashboard-stat">
                  <div className="dashboard-stat-value">{stats.totalChunks}</div>
                  <div className="dashboard-stat-label">Total chunks learned</div>
                </div>
              </Card>

              <Card>
                <div className="dashboard-stat">
                  <div className="dashboard-stat-value">
                    {stats.averageAccuracy}%
                  </div>
                  <div className="dashboard-stat-label">Average accuracy</div>
                </div>
              </Card>

              <Card>
                <div className="dashboard-stat">
                  <div className="dashboard-stat-value">
                    {stats.totalTimeMinutes}
                  </div>
                  <div className="dashboard-stat-label">Minutes spent learning</div>
                </div>
              </Card>
            </div>

            {/* Calibration Insight */}
            <div className="dashboard-section">
              <h2 className="dashboard-section-title">📊 Calibration</h2>
              <Card>
                <div className="dashboard-calibration">
                  <div className="dashboard-calibration-comparison">
                    <div className="dashboard-calibration-item">
                      <span className="dashboard-calibration-label">
                        Your confidence:
                      </span>
                      <span className="dashboard-calibration-value">
                        {stats.averageConfidence}%
                      </span>
                    </div>
                    <div className="dashboard-calibration-item">
                      <span className="dashboard-calibration-label">
                        Your accuracy:
                      </span>
                      <span className="dashboard-calibration-value">
                        {stats.averageAccuracy}%
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-calibration-message">
                    {Math.abs(stats.averageConfidence - stats.averageAccuracy) < 10 ? (
                      <p>
                        ✅ Great calibration! You're accurately assessing your
                        understanding.
                      </p>
                    ) : stats.averageConfidence > stats.averageAccuracy ? (
                      <p>
                        📊 You tend to be{" "}
                        {Math.abs(stats.averageConfidence - stats.averageAccuracy)}%
                        overconfident. Continue practicing to improve your
                        self-assessment.
                      </p>
                    ) : (
                      <p>
                        📊 You tend to be{" "}
                        {Math.abs(stats.averageConfidence - stats.averageAccuracy)}%
                        underconfident. Trust yourself more - you know more than you
                        think!
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Growth Trends */}
            {stats.weeklyTrends && stats.weeklyTrends.length > 1 && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">📈 Your growth over time</h2>
                <Card>
                  <div className="dashboard-trends">
                    <div className="dashboard-trend-chart">
                      {stats.weeklyTrends.map((trend, index) => {
                        const barHeight = Math.max(trend.accuracy, 10);
                        const isLatest = index === stats.weeklyTrends.length - 1;
                        return (
                          <div key={index} className="dashboard-trend-bar-container">
                            <div className="dashboard-trend-bar-wrapper">
                              <div
                                className={`dashboard-trend-bar ${isLatest ? "latest" : ""}`}
                                style={{ height: `${barHeight}%` }}
                              >
                                <span className="dashboard-trend-bar-value">
                                  {trend.accuracy}%
                                </span>
                              </div>
                            </div>
                            <span className="dashboard-trend-bar-label">Week {trend.week}</span>
                          </div>
                        );
                      })}
                    </div>
                    {stats.weeklyTrends.length >= 2 && (
                      <div className="dashboard-trend-insight">
                        {(() => {
                          const firstWeek = stats.weeklyTrends[0];
                          const lastWeek = stats.weeklyTrends[stats.weeklyTrends.length - 1];
                          const accuracyChange = lastWeek.accuracy - firstWeek.accuracy;
                          const calibrationChange = firstWeek.calibrationError - lastWeek.calibrationError;

                          return (
                            <>
                              {accuracyChange > 5 && (
                                <p>
                                  🎉 Great progress! Your accuracy improved by {accuracyChange}%
                                  from week {firstWeek.week} to week {lastWeek.week}.
                                </p>
                              )}
                              {calibrationChange > 5 && (
                                <p>
                                  🎯 Your calibration improved by {calibrationChange}% - you're
                                  getting better at self-assessment!
                                </p>
                              )}
                              {accuracyChange <= 5 && calibrationChange <= 5 && (
                                <p>
                                  📊 Keep learning! Your accuracy is at {lastWeek.accuracy}% with
                                  {lastWeek.calibrationError}% calibration error.
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Goal Achievement */}
            {stats.goalStats && stats.goalStats.length > 0 && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">🎯 Goal achievement</h2>
                <div className="dashboard-goals">
                  {stats.goalStats.map((item, index) => (
                    <Card key={index}>
                      <div className="dashboard-goal">
                        <div className="dashboard-goal-header">
                          <span className="dashboard-goal-name">{item.goal}</span>
                          <span className="dashboard-goal-attempts">
                            {item.attempts} {item.attempts === 1 ? "attempt" : "attempts"}
                          </span>
                        </div>
                        <div className="dashboard-goal-stats">
                          <div className="dashboard-goal-stat">
                            <span className="dashboard-goal-stat-label">Achievement rate:</span>
                            <span className="dashboard-goal-stat-value">{item.achievementRate}%</span>
                          </div>
                          <div className="dashboard-goal-stat">
                            <span className="dashboard-goal-stat-label">Average accuracy:</span>
                            <span className="dashboard-goal-stat-value">{item.averageAccuracy}%</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {stats.goalStats.length > 1 && (
                  <Card>
                    <div className="dashboard-recommendation">
                      {(() => {
                        const best = stats.goalStats[0];
                        const worst = stats.goalStats[stats.goalStats.length - 1];
                        const diff = best.achievementRate - worst.achievementRate;

                        if (diff > 20) {
                          return (
                            <>
                              <strong>💡 Insight:</strong> You achieve "{best.goal}" {best.achievementRate}%
                              of the time but only {worst.achievementRate}% for "{worst.goal}".
                              Consider spending more time planning when your goal is "{worst.goal}".
                            </>
                          );
                        } else {
                          return (
                            <>
                              <strong>💡 Insight:</strong> Your goal achievement is consistent across
                              different learning goals. Keep up the balanced approach!
                            </>
                          );
                        }
                      })()}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Strategy Performance */}
            {stats.strategyStats && stats.strategyStats.length > 0 && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">🎯 Strategy performance</h2>
                <div className="dashboard-strategies">
                  {stats.strategyStats.map((item, index) => (
                    <Card key={index}>
                      <div className="dashboard-strategy">
                        <div className="dashboard-strategy-header">
                          <span className="dashboard-strategy-name">
                            {item.strategy}
                          </span>
                          <span className="dashboard-strategy-uses">
                            {item.uses} {item.uses === 1 ? "use" : "uses"}
                          </span>
                        </div>
                        <div className="dashboard-strategy-stats">
                          <div className="dashboard-strategy-stat">
                            <span className="dashboard-strategy-stat-label">
                              Accuracy:
                            </span>
                            <span className="dashboard-strategy-stat-value">
                              {item.averageAccuracy}%
                            </span>
                          </div>
                          {item.helpfulPercentage !== null && (
                            <div className="dashboard-strategy-stat">
                              <span className="dashboard-strategy-stat-label">
                                Helpful:
                              </span>
                              <span className="dashboard-strategy-stat-value">
                                {item.helpfulPercentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {stats.strategyStats.length > 0 && (
                  <Card>
                    <div className="dashboard-recommendation">
                      <strong>💡 Recommendation:</strong> Your most effective
                      strategy is "{stats.strategyStats[0].strategy}" with{" "}
                      {stats.strategyStats[0].averageAccuracy}% accuracy. Try using
                      it more often!
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Contextual Strategy Insights */}
            {stats.strategyGoalInsights && stats.strategyGoalInsights.length > 0 && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">🔍 Strategy-goal insights</h2>
                <p className="dashboard-section-description">
                  Discover how different strategies work for different learning goals
                </p>
                {stats.strategyGoalInsights.slice(0, 3).map((insight, index) => (
                  <Card key={index} style={{ marginBottom: "16px" }}>
                    <div className="dashboard-insight">
                      <h3 className="dashboard-insight-title">{insight.strategy}</h3>
                      <p className="dashboard-insight-text">
                        Works best for <strong>"{insight.bestGoal}"</strong> ({insight.bestAccuracy}% accuracy)
                        {insight.worstGoal && (
                          <>
                            {" "}but less effective for <strong>"{insight.worstGoal}"</strong> ({insight.worstAccuracy}% accuracy)
                          </>
                        )}.
                      </p>
                      <div className="dashboard-insight-bars">
                        {insight.goalPerformances.map((perf, idx) => (
                          <div key={idx} className="dashboard-insight-bar-item">
                            <div className="dashboard-insight-bar-label">
                              <span>{perf.goal}</span>
                              <span className="dashboard-insight-bar-uses">
                                {perf.uses} {perf.uses === 1 ? "use" : "uses"}
                              </span>
                            </div>
                            <div className="dashboard-insight-bar-container">
                              <div
                                className="dashboard-insight-bar"
                                style={{ width: `${perf.accuracy}%` }}
                              >
                                <span className="dashboard-insight-bar-value">{perf.accuracy}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Reflection Patterns */}
            {stats.reflectionPatterns && stats.reflectionPatterns.length > 0 && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">💭 Reflection patterns</h2>
                <p className="dashboard-section-description">
                  Track your learning plans and whether you followed through
                </p>
                <Card>
                  <div className="dashboard-patterns">
                    {stats.reflectionPatterns.map((pattern, index) => (
                      <div key={index} className="dashboard-pattern">
                        <div className="dashboard-pattern-header">
                          <span className="dashboard-pattern-text">"{pattern.plan}"</span>
                          <span className="dashboard-pattern-count">
                            Planned {pattern.count} {pattern.count === 1 ? "time" : "times"}
                          </span>
                        </div>
                        <div className="dashboard-pattern-execution">
                          <div className="dashboard-pattern-execution-bar-container">
                            <div
                              className="dashboard-pattern-execution-bar"
                              style={{ width: `${pattern.executionRate}%` }}
                            />
                          </div>
                          <span className="dashboard-pattern-execution-label">
                            {pattern.executionRate}% follow-through
                            {pattern.executionRate >= 70 && " 🎯"}
                            {pattern.executionRate < 70 && pattern.executionRate >= 40 && " 📊"}
                            {pattern.executionRate < 40 && " 💡"}
                          </span>
                        </div>
                        {pattern.executionRate < 50 && pattern.count >= 3 && (
                          <p className="dashboard-pattern-tip">
                            You've planned this {pattern.count} times but only followed through {pattern.executedCount} times. Consider why this plan is hard to execute.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Learning Efficiency */}
            {stats.efficiencyInsight && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">⚡ Learning efficiency</h2>
                <p className="dashboard-section-description">
                  Understand the relationship between time spent and accuracy
                </p>
                <Card>
                  <div className="dashboard-efficiency">
                    <div className="dashboard-efficiency-comparison">
                      <div className="dashboard-efficiency-item">
                        <div className="dashboard-efficiency-label">Quick responses</div>
                        <div className="dashboard-efficiency-value">
                          ~{Math.round(stats.efficiencyInsight.fastAvgTime / 60)}min
                        </div>
                        <div className="dashboard-efficiency-accuracy">
                          {stats.efficiencyInsight.fastAvgAccuracy}% accuracy
                        </div>
                      </div>
                      <div className="dashboard-efficiency-arrow">→</div>
                      <div className="dashboard-efficiency-item">
                        <div className="dashboard-efficiency-label">Slow responses</div>
                        <div className="dashboard-efficiency-value">
                          ~{Math.round(stats.efficiencyInsight.slowAvgTime / 60)}min
                        </div>
                        <div className="dashboard-efficiency-accuracy">
                          {stats.efficiencyInsight.slowAvgAccuracy}% accuracy
                        </div>
                      </div>
                    </div>
                    <div className="dashboard-efficiency-insight">
                      {stats.efficiencyInsight.accuracyGain < 5 ? (
                        <p>
                          💡 You spend {stats.efficiencyInsight.timeMultiplier}x longer on some chunks but only gain {stats.efficiencyInsight.accuracyGain}% accuracy.
                          Consider using more efficient strategies or moving on when you hit diminishing returns.
                        </p>
                      ) : stats.efficiencyInsight.accuracyGain >= 15 ? (
                        <p>
                          ✅ Taking more time pays off! You gain {stats.efficiencyInsight.accuracyGain}% accuracy when spending {stats.efficiencyInsight.timeMultiplier}x longer.
                          Keep investing time where it matters.
                        </p>
                      ) : (
                        <p>
                          📊 Spending {stats.efficiencyInsight.timeMultiplier}x longer improves accuracy by {stats.efficiencyInsight.accuracyGain}%.
                          This is a reasonable trade-off for important topics.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Muddy Point Patterns */}
            {stats.muddyPointInsights && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">🌫️ Common struggles</h2>
                <p className="dashboard-section-description">
                  Patterns in what you find challenging (from {stats.muddyPointInsights.totalMuddyPoints} muddy points)
                </p>
                <div className="dashboard-muddy-themes">
                  {stats.muddyPointInsights.themes.map((theme, index) => (
                    <Card key={index}>
                      <div className="dashboard-muddy-theme">
                        <div className="dashboard-muddy-theme-header">
                          <span className="dashboard-muddy-theme-name">{theme.theme}</span>
                          <span className="dashboard-muddy-theme-count">
                            {theme.count} {theme.count === 1 ? "time" : "times"}
                          </span>
                        </div>
                        <div className="dashboard-muddy-theme-accuracy">
                          Average accuracy: <strong>{theme.avgAccuracy}%</strong>
                        </div>
                        {theme.examples.length > 0 && (
                          <div className="dashboard-muddy-theme-examples">
                            <div className="dashboard-muddy-theme-examples-label">Examples:</div>
                            {theme.examples.map((example, idx) => (
                              <div key={idx} className="dashboard-muddy-theme-example">
                                "{example}"
                              </div>
                            ))}
                          </div>
                        )}
                        {theme.avgAccuracy < 70 && (
                          <div className="dashboard-muddy-theme-tip">
                            💡 Try using "work an example" or "connect to what I know" strategies for this type of content
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            {stats.recentSessions && stats.recentSessions.length > 0 && (
              <div className="dashboard-section">
                <h2 className="dashboard-section-title">📚 Recent sessions</h2>
                <div className="dashboard-sessions">
                  {stats.recentSessions.map((session) => (
                    <Card key={session._id} hover onClick={() => navigate(`/learning/${session._id}`)}>
                      <div className="dashboard-session">
                        <div className="dashboard-session-content">
                          <div className="dashboard-session-title">
                            {session.contentPreview}
                          </div>
                          <div className="dashboard-session-meta">
                            {session.status === "completed" ? (
                              <span className="dashboard-session-status completed">
                                ✓ Completed
                              </span>
                            ) : (
                              <span className="dashboard-session-status in-progress">
                                ⏸ In Progress ({session.sessionStats?.chunksCompleted || 0}/
                                {session.sessionStats?.totalChunks || 0})
                              </span>
                            )}
                            <span className="dashboard-session-date">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {session.status === "completed" && session.sessionStats && (
                          <div className="dashboard-session-stats">
                            <div className="dashboard-session-stat">
                              <span className="dashboard-session-stat-value">
                                {session.sessionStats.averageAccuracy}%
                              </span>
                              <span className="dashboard-session-stat-label">
                                Accuracy
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="dashboard-actions">
          <Button
            variant="primary"
            onClick={() => navigate("/upload")}
            fullWidth
          >
            Start new session
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/library")}
            fullWidth
          >
            View all sessions
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
            fullWidth
          >
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
