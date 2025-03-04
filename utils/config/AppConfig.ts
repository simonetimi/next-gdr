import "server-only";

export class AppConfig {
  public static getAppUrl() {
    return process.env.APP_URL;
  }

  public static getDatabaseUrl() {
    return process.env.DATABASE_URL;
  }

  public static getCronSecret() {
    return process.env.CRON_SECRET;
  }
}
