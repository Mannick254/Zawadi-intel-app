<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="https://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <head><title>Sitemap</title></head>
      <body>
        <h1>Sitemap</h1>
        <table border="1">
          <tr><th>URL</th><th>Change Frequency</th><th>Priority</th></tr>
          <xsl:for-each select="urlset/url">
            <tr>
              <td><xsl:value-of select="loc"/></td>
              <td><xsl:value-of select="changefreq"/></td>
              <td><xsl:value-of select="priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
