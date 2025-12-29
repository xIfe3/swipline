export class DateHelper {
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static formatForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static getEstimatedDeliveryDate(startDate: Date, destination: string): Date {
    const deliveryTimes = {
      US: 7,
      UK: 5,
      CA: 6,
      AU: 10,
      EU: 4,
    };

    const days = deliveryTimes[destination] || 7;
    return this.addDays(startDate, days);
  }

  static isPastDue(deliveryDate: Date): boolean {
    return new Date() > deliveryDate;
  }
}
