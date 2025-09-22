const COMMON_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
  body { margin: 0; padding: 0; }
  .container { max-width: 600px; padding: 20px; }
  .logo { width: auto; height: 80px; }
  h1 { font-weight: bold; color: #374151; margin-top: 20px; }
  .main-text { margin-top: 10px; color: #4B5563; padding-bottom: 10px; }
  .action-btn { display: flex; justify-content: center; margin-top: 20px; }
  .action-btn a { text-decoration: none; }
  button {
    border: 0; border-radius: 20px; color: #fff; padding: 1em 1.8em;
    background: #0269f8; font-weight: bold; cursor: pointer; transition: 0.2s background;
  }
  button:hover { background-color: #60a543; }
  .footer-text { margin-top: 20px; color: #6B7280; line-height: 1.5; }
  .contact-link { color: #3B82F6; text-decoration: none; }
  .contact-link:hover { text-decoration: underline; }
  @media only screen and (max-width: 600px) {
    .container { padding: 10px; }
    .logo { height: 60px; }
  }
`;

export const TEMPLATE_WELCOME_MAIL = (name: string, verificationUrl: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Welcome to Skill Exchange</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${COMMON_STYLES}</style>
  </head>
  <body>
    <div class="container">
      <header>
        <img class="logo" src="https://i.ibb.co/3kQwY8g/skill-exchange-logo.png" alt="Skill Exchange Logo" style="width: 220px; height: auto;">
      </header>
      <main>
        <h1>Hello ${name},</h1>
        <p class="main-text">
          Welcome to <b>Skill Exchange</b>! We're excited to have you join our community where users help each other by posting and completing tasks.<br>
          To get started, please verify your email by clicking the button below:
        </p>
        <div class="action-btn">
          <a href="${verificationUrl}" target="_blank">
            <button>Verify Your Email</button>
          </a>
        </div>
        <p class="main-text">
          This link will expire in 10 minutes. Please do not share this link with anyone for your account's security.
        </p>
        <p class="main-text">
          Happy exchanging!<br>
          The Skill Exchange Team
        </p>
      </main>
      <footer>
        <p class="footer-text">
          Need help? Contact us at <a href="mailto:support@skillexchange.com" class="contact-link">support@skillexchange.com</a>
        </p>
      </footer>
    </div>
  </body>
  </html>
`;

export const TEMPLATE_RESET_MAIL = (name: string, resetUrl: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Reset Your Password - Skill Exchange</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${COMMON_STYLES}</style>
  </head>
  <body>
    <div class="container">
      <header>
        <img class="logo" src="https://i.ibb.co/3kQwY8g/skill-exchange-logo.png" alt="Skill Exchange Logo" style="width: 220px; height: auto;">
      </header>
      <main>
        <h1>Hello ${name},</h1>
        <p class="main-text">
          We received a request to reset your Skill Exchange password.<br>
          Click the button below to set a new password:
        </p>
        <div class="action-btn">
          <a href="${resetUrl}" target="_blank">
            <button>Reset Password</button>
          </a>
        </div>
        <p class="main-text">
          This link will expire in 10 minutes. If you did not request a password reset, please ignore this email.
        </p>
        <p class="main-text">
          The Skill Exchange Team
        </p>
      </main>
      <footer>
        <p class="footer-text">
          Need help? Contact us at <a href="mailto:support@skillexchange.com" class="contact-link">support@skillexchange.com</a>
        </p>
      </footer>
    </div>
  </body>
  </html>
`;