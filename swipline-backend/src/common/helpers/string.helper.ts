export class StringHelper {
  static generateTrackingId(prefix = 'SWP'): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${year}${month}${random}`;
  }

  static formatAddress(address: string): string {
    return address.trim().replace(/\s+/g, ' ');
  }

  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername =
      username.slice(0, 3) + '*'.repeat(username.length - 3);
    return `${maskedUsername}@${domain}`;
  }

  static maskPhone(phone: string): string {
    return phone.replace(/\d(?=\d{4})/g, '*');
  }
}
