// Branded magic-link email for Coach Bob. Table + inline styles for broad
// email-client compatibility (Gmail/Outlook strip <style> and SVG).

const NAVY = "#1B2A4A";
const CORAL = "#FF6B5C";
const GRAY_BG = "#F3F5F8";
const MUTED = "#6B7688";

export function loginEmailSubject(): string {
  return "Your Coach Bob login link";
}

export function loginEmailHtml(url: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${GRAY_BG};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GRAY_BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border:1px solid #E3E7EE;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;height:40px;background:${NAVY};border-radius:10px;text-align:center;vertical-align:middle;font-weight:800;font-size:22px;color:${CORAL};line-height:40px;">b</td>
                    <td style="padding-left:10px;font-weight:800;font-size:18px;color:${NAVY};">Coach&nbsp;Bob</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:${CORAL};font-weight:700;">SIGN IN</div>
                <div style="font-size:26px;font-weight:800;color:${NAVY};margin-top:6px;">Let&rsquo;s get to work.</div>
                <p style="font-size:15px;line-height:1.5;color:#2A3244;margin:14px 0 0 0;">
                  Tap below to log in to Coach Bob. This link signs you in on this device and expires shortly.
                  If you didn&rsquo;t ask for it, just ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${CORAL};border-radius:11px;">
                      <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Sign in &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 28px 32px;">
                <p style="font-size:12px;line-height:1.5;color:${MUTED};margin:0;">
                  Button not working? Paste this link into your browser:<br />
                  <a href="${url}" style="color:${NAVY};word-break:break-all;">${url}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:${GRAY_BG};border-top:1px solid #E3E7EE;">
                <div style="font-size:11px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;">
                  Coach Bob &mdash; show up, do the thing, every damn day.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function loginEmailText(url: string): string {
  return `Sign in to Coach Bob\n\nTap to log in: ${url}\n\nThis link expires shortly. If you didn't request it, ignore this email.`;
}
