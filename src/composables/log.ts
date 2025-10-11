export function useLog() {
    function log(d: any): void {
        console.log(JSON.stringify(d, null, 2));
    }

    function error(e: any): void {
        console.error(e);
    }

    return { log, error };
}
