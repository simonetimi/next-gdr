export class ClientConfig {
  public static getLocale(): string {
    return process.env.NEXT_PUBLIC_LOCALE ?? "it-IT";
  }
}
