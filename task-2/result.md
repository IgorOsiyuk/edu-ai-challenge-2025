# Bug Ticket

**Title:** Logout button unresponsive in Safari browser

**Description:** The logout button fails to respond to user clicks when accessed through Safari browser. Users are unable to log out of the application, which creates a significant security and usability concern as sessions remain active.

**Steps to Reproduce:**

1. Open the application in Safari browser
2. Log into the application with valid credentials
3. Navigate to the logout button location
4. Click on the logout button
5. Observe that no action is triggered

**Expected vs Actual Behavior:**

- **Expected:** Clicking the logout button should terminate the user session and redirect to the login page or home page
- **Actual:** The logout button does not respond to clicks; no visual feedback, no session termination, and user remains logged in

**Environment:**

- Browser: Safari (version not specified)
- OS: Not specified
- Device type: Not specified

**Severity or Impact:** Critical - This is a security issue that prevents users from properly logging out, potentially leaving accounts vulnerable if users cannot terminate their sessions, especially on shared or public devices.
