/**
 * Base email layout for GudGig system emails.
 * Uses a LinkedIn-inspired professional design language.
 */
export const wrapInBaseLayout = ({ title, content, footer, recipientName, actionUrl, actionText }) => {
  const primaryColor = '#0A66C2';
  const bgColor = '#F3F2EF';
  const textColor = '#0F172A';
  const mutedTextColor = '#666666';
  const borderColor = '#E1E5E9';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: ${bgColor};
      margin: 0;
      padding: 0;
      color: ${textColor};
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: ${bgColor};
      padding-bottom: 40px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-top: 40px;
    }
    .header {
      background-color: #ffffff;
      padding: 24px 40px;
      border-bottom: 1px solid ${borderColor};
      text-align: left;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: ${primaryColor};
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .logo span {
      background: ${primaryColor};
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 2px;
    }
    .content {
      padding: 40px;
    }
    .footer {
      padding: 24px 40px;
      text-align: center;
      color: ${mutedTextColor};
      font-size: 13px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${primaryColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 24px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .footer-links a {
      color: ${mutedTextColor};
      text-decoration: underline;
      margin: 0 8px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin-top: 0;
      color: ${textColor};
    }
    p {
      margin: 16px 0;
    }
    .otp-capsule {
      background-color: ${bgColor};
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #000;
    }
    hr {
      border: none;
      border-top: 1px solid ${borderColor};
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td class="header">
          <a href="https://gudgig.com" class="logo">Gud<span>Gig</span></a>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${recipientName ? `<h1>Hello ${recipientName},</h1>` : ''}
          <div style="font-size: 16px;">
            ${content}
          </div>
          ${actionUrl && actionText ? `
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <a href="${actionUrl}" class="button">${actionText}</a>
                </td>
              </tr>
            </table>
          ` : ''}
          <hr />
          <p style="font-size: 14px; color: ${mutedTextColor};">
            Best regards,<br />
            <strong>The GudGig Team</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <div class="footer-links">
            <a href="https://gudgig.com/support">Support</a>
            <a href="https://gudgig.com/privacy">Privacy</a>
            <a href="https://gudgig.com/terms">Terms</a>
          </div>
          <p style="margin-top: 16px;">
            &copy; ${new Date().getFullYear()} GudGig. All rights reserved.
          </p>
          <p>
            You're receiving this because you're a registered user of GudGig.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};
