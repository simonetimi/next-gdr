export class AppConfig {
  public static getAppUrl() {
    return process.env.APP_URL;
  }

  public static getAuthSecret() {
    return process.env.AUTH_SECRET;
  }

  public static getGithubAuthId() {
    return process.env.AUTH_GITHUB_ID;
  }

  public static getGithubAuthSecret() {
    return process.env.AUTH_GITHUB_SECRET;
  }

  public static getDatabaseUrl() {
    return process.env.DATABASE_URL;
  }

  public static getCronSecret() {
    return process.env.CRON_SECRET;
  }
}
