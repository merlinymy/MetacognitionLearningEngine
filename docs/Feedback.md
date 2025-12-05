## Feedback Items - Status Summary

### ✅ Implemented

- If user input anything in the muddiest part, During evaluate part, it should mention and explain it to the user.

  **Status: ✅ Fixed** - The LLM evaluation now receives the muddiest point and addresses it in the feedback when provided.

- In evaluate phase, user can't update their evaluation (buttons and texts)

  **Status: ✅ Fixed** - Removed the disabled state from evaluation inputs. Users can now update their goal achievement, strategy reflection, and next-time plans.

- Topic should be bigger in Plan page

  **Status: ✅ Fixed** - Topic text is now displayed at 20px font size in the Plan page.

- update the prompt so that the chunks use simpler words and sentences (but keep the jargon) and use day-to-day everyday life metaphore when it makes sense.

  **Status: ✅ Fixed** - Updated all LLM chunk generation prompts to use simpler language, shorter sentences, and everyday metaphors while keeping technical jargon.

- In the plan page, if user put down information for "What do you already know about this topic?", our system should use this information, right?

  **Status: ✅ Fixed** - Prior knowledge is now passed to the evaluation LLM and used as context when generating feedback.

### 📋 Design Decisions & Architectural Notes

- How do we handle different goals more effectively? Right now, Monitor page for different goals has same questions.
  (I guess user can reply with a question and how to solve it in their answer, but wouldn't it be nice if our system provide a problem to the user?)

  **Status: ✅ Implemented** - The chunk generation system has been updated to generate goal-specific questions! Each chunk now includes three different questions and expected points tailored to each learning goal:
  - **"Get the gist"** - Tests surface-level understanding of the main idea
  - **"Be able to explain"** - Tests deep understanding to teach others
  - **"Apply to a problem"** - Tests practical application to solve problems

  Changes made:
  - [geminiService.js](../services/llm/geminiService.js): Updated prompts to generate 3 question variants per chunk
  - [openaiService.js](../services/llm/openaiService.js): Updated prompts to generate 3 question variants per chunk
  - [claudeService.js](../services/llm/claudeService.js): Updated prompts to generate 3 question variants per chunk
  - [onDeviceService.js](../services/llm/onDeviceService.js): Updated mock implementation to generate 3 question variants per chunk
  - [Learning.jsx:624-625](../frontend/src/pages/Learning.jsx#L624-L625): Displays the question matching the user's selected goal
  - [userResponseRoute.js:126-128](../routes/userResponseRoute.js#L126-L128): Uses goal-specific question and expected points for evaluation

  The Monitor phase now shows different questions based on your goal, making the learning experience more targeted and effective!

- I want user be able to ask for hints

  **Status: ✅ Already implemented** - Users can click "Show hint" button in the Monitor phase to reveal hints progressively.

- Why did this strategy work or not work for you? User may find answering this for the same strategy repetitive.

  **Status: Design decision** - This repetition is intentional for metacognitive reflection. The same strategy might work differently for different content/contexts, so asking each time helps users develop awareness of when strategies are effective. However, if this becomes burdensome, we could:
  1. Track strategy usage and only ask detailed reflection every N uses
  2. Add context-specific prompts like "How did [strategy] work for THIS topic compared to previous topics?"
  3. Allow users to reference previous reflections

- Plan for next time part: what does it do for metacognition? Why are there no choice for use the same strategy?

  **Status: ✅ Fixed** - Added "Keep using the same strategy" as an option in the "Plan for Next Time" section. This helps with metacognitive planning by allowing users to explicitly decide to continue with a successful strategy.

- Different Strategy should have a slightly different Monitor interface, no? Or is that not neccesary because text answer can pretty much applied to all the strategies?

  **Status: Design decision** - Currently using a unified text interface for all strategies to keep the system simple and flexible. Each strategy shows its guidance text (e.g., "Imagine teaching this to a friend" for self-explain), which prompts the user on how to approach the answer.

  Pros of current approach: Simple, flexible, all responses are comparable
  Cons: Less structured guidance for specific strategies

  Potential enhancements:
  1. Add strategy-specific placeholder text in the answer box
  2. Provide visual scaffolds (e.g., diagram template for "visualize it")
  3. Add optional structured inputs (e.g., "Example:" field for "work an example" strategy)

- user dashboard is not implemented

  **Status: ✅ Implemented** - A comprehensive user dashboard has been created with the following features:
  - Overall statistics: completed sessions, total chunks learned, average accuracy, time spent
  - Calibration analysis: compares confidence vs accuracy and provides feedback
  - Strategy performance: shows accuracy and helpfulness percentage for each strategy used
  - Personalized recommendations: suggests the most effective strategy
  - Recent sessions: displays last 5 sessions with quick access
  - Accessible from the landing page via "View dashboard" button

- implement login/logout/signup feature using passport.js. Create necessary collection in mongo as well

  **Status: ✅ Implemented** - A modern passwordless authentication system has been implemented with:

  **Backend:**
  - Passwordless authentication using email passcodes (no password required!)
  - Google OAuth integration for social login
  - Passcode system: 6-digit codes sent via email, valid for 10 minutes
  - Email service with nodemailer (uses Ethereal for development, configurable SMTP for production)
  - MongoDB collections: users (with support for both email and Google auth), passcodes (with TTL index), sessions
  - Session management with express-session and connect-mongo (7-day expiration)
  - Authentication routes:
    - POST /api/auth/signup/request - Request signup passcode
    - POST /api/auth/signup/verify - Verify passcode and create account
    - POST /api/auth/login/request - Request login passcode
    - POST /api/auth/login/verify - Verify passcode and log in
    - GET /api/auth/google - Initiate Google OAuth
    - GET /api/auth/google/callback - Handle Google OAuth callback
    - POST /api/auth/logout - Log out
    - GET /api/auth/me - Get current user

  **Frontend:**
  - Signup flow: Enter name + email → Receive code via email → Enter code → **Prompted to create passkey** → Account created
  - Login flow: **Sign in with Passkey** (instant, biometric) OR Enter email → Receive code → Enter code → **Prompted to create passkey** → Logged in
  - Google Sign-in button on both login and signup pages
  - **Passkey Setup page**: Shown after email/code authentication, offering to create passkey for faster future logins
  - Beautiful gradient UI with proper loading states and error handling
  - Two-step verification process with "Back" button for easy navigation
  - User state management in App.jsx with authentication checking on mount
  - Landing page displays user name and logout button

  **Passkey Support (WebAuthn):**
  - **After email or Google signup/login, users are prompted to create a passkey**
  - "Sign in with Passkey" button on login page for instant authentication
  - Passkeys use device biometrics (Face ID, Touch ID, Windows Hello, etc.)
  - WebAuthn implementation using @simplewebauthn/server and @simplewebauthn/browser
  - Passkeys stored in MongoDB with credential ID, public key, and counter
  - Multiple passkeys per user supported (e.g., laptop, phone)
  - Optional device naming for passkey management
  - Passkey authentication bypasses passkey setup prompt (only shown after email/code login)
  - Users can skip passkey setup and create one later

  **Security:**
  - No password storage - fully passwordless for email authentication
  - Passcodes expire after 10 minutes
  - One-time use passcodes (consumed after verification)
  - Automatic cleanup of expired passcodes via MongoDB TTL index
  - Passkeys use public-key cryptography (device never shares private key)
  - Biometric authentication integrated with device security
  - Secure sessions with HttpOnly cookies

- Sessions and library should be user-specific

  **Status: ✅ Fixed** - All sessions are now tied to the authenticated user:
  - Frontend: Library, Dashboard, and Upload components now receive and use the logged-in user's ID
  - Backend: Sessions are created with the user's ID and filtered by userId when retrieving
  - Each user now has their own private library of learning sessions
  - Anonymous sessions still supported as fallback for users not logged in
  - Changes made:
    - [App.jsx](../frontend/src/App.jsx): Pass `user` prop to Library, Dashboard, and Upload
    - [Library.jsx](../frontend/src/pages/Library.jsx): Use `user._id` for fetching sessions
    - [Dashboard.jsx](../frontend/src/pages/Dashboard.jsx): Use `user._id` instead of hardcoded ID
    - [Upload.jsx](../frontend/src/pages/Upload.jsx): Pass `userId` when creating sessions
    - [api.js](../frontend/src/services/api.js): Updated `generateChunks` to accept userId parameter
    - [chunkRoute.js](../routes/chunkRoute.js): Accept and use userId when creating sessions
    - [sessionRoute.js](../routes/sessionRoute.js): Use authenticated user from session

- Why did this strategy work or not work for you? User may find answering this for the same strategy repetitive.

  **Status: ✅ Implemented** - Dynamic strategy reflection prompts have been added to reduce repetition:
  - First use: "Why did this strategy work or not work for you?"
  - Second use: "You used this strategy once before. How did it work this time compared to last time?"
  - Third+ use: "You've used this strategy X times now. What patterns are you noticing?"
  - Previous reflections (1-2 most recent) are displayed above the prompt showing helpfulness rating and accuracy
  - Changes made:
    - [userResponseRoute.js:328-365](../routes/userResponseRoute.js#L328-L365): New endpoint to fetch strategy history
    - [api.js:149-151](../frontend/src/services/api.js#L149-L151): Added `getStrategyHistory()` function
    - [Learning.jsx:263-273](../frontend/src/pages/Learning.jsx#L263-L273): Fetches strategy history on evaluation
    - [Learning.jsx:381-409](../frontend/src/pages/Learning.jsx#L381-L409): Dynamic prompt generation and history display

### 🔄 Planned Improvements

- Dashboard enhancements for better metacognitive value

  **Status: 📋 Planned** - Current dashboard (metacognitive score: 6/10) is good for awareness but weak for regulation. It shows what happened but doesn't help users track improvement or make better decisions.

  **What's working well:**
  - ✅ Calibration analysis (confidence vs accuracy)
  - ✅ Strategy performance with accuracy + helpfulness
  - ✅ Concrete strategy recommendation

  **Planned improvements:**
  1. **Trend Data & Growth Tracking** ✅ **DONE**
     - Show calibration improvement over time (bar chart)
     - "Your calibration error decreased from 25% to 10% - you're getting better at self-assessment!"
     - Track accuracy trends per strategy over time
     - Implementation: Group responses by week, calculate averages
     - **Note**: Bar chart shows weekly accuracy trends with dynamic insights on improvement

  2. **Goal Achievement Analysis** ✅ **DONE**
     - Currently captured but not displayed on dashboard
     - Show: "You achieve 'Get the gist' 90% of the time but only 60% for 'Apply to problem'"
     - Recommendation: "Consider spending more time planning when your goal is application"
     - Implementation: Aggregate `goalAchieved` by goal type
     - **Note**: Dashboard now shows achievement rate and average accuracy per goal with comparative insights

  3. **Contextual Strategy Insights** ✅ **DONE**
     - Currently shows: "self-explain = 85% accuracy" (overall)
     - Planned: "Self-explain works best for 'Be able to explain' goals (92%) but less for 'Apply' (73%)"
     - Matrix view: Strategy × Goal → Accuracy
     - Implementation: Cross-tabulate strategy/goal/accuracy
     - **Note**: Dashboard now shows top 3 strategy-goal insights with visual bars showing performance differences

  4. **Reflection Pattern Mining** ✅ **DONE**
     - Currently captures "next time adjustment" but doesn't surface patterns
     - Show: "You've planned to 'use more examples' 5 times - did you try it? How did it work?"
     - Track plan → execution gap
     - Implementation: Compare `nextTimeAdjustment` from previous chunk with actual strategy used in next chunk
     - **Note**: Dashboard now tracks recurring plans and shows follow-through rate with tips for low-execution patterns

  5. **Learning Efficiency Analysis** ✅ **DONE**
     - Time is captured but not analyzed
     - Show: "You spend 2x longer on Monitor phase but only get 5% better accuracy - try different strategies"
     - Identify diminishing returns
     - Implementation: Correlate time spent vs accuracy gained
     - **Note**: Dashboard compares quick vs slow responses, shows time-accuracy trade-off with personalized insights

  6. **Muddiest Point Pattern Detection** ✅ **DONE**
     - Currently captured in each response but not analyzed
     - Show: "You often struggle with 'abstract concepts' - consider using 'work an example' strategy"
     - Use text analysis to cluster common themes
     - Implementation: Aggregate and categorize `muddyPoint` text
     - **Note**: Dashboard detects common struggle themes using keyword matching, shows examples and strategy recommendations

  **All planned improvements have been completed! 🎉**

  The dashboard now provides comprehensive metacognitive insights including:
  - Weekly accuracy trends with calibration improvement tracking
  - Goal achievement analysis with personalized recommendations
  - Strategy-goal performance matrix showing contextual effectiveness
  - Reflection pattern mining with follow-through tracking
  - Time efficiency analysis identifying diminishing returns
  - Muddy point pattern detection with targeted strategy suggestions
