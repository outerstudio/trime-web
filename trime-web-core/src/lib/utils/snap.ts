/** Include `revision` in reactive deps so computed values re-run. */
export function snap<T>(revision: number, value: T): T {
    void revision;
    return value;
}
