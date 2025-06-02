export class CommonUtils {
    static convertDate(input?: string): string {
        if (!input) {
            return '';
        }
    
        console.log(`Converting date: ${input}`);
    
        const [day, month, year] = input.split('/').map(Number);
        // Create date in UTC
        const date = new Date(Date.UTC(year, month - 1, day));
        date.setHours(date.getHours() - 7); // Adjust for UTC+7 timezone
        return date.toISOString();
    }
    
}