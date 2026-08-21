var id: number = Date.now();

export function newId(): number {
    id++;
    return id;
}
