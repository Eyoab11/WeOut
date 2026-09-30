// A data URI survives browser refresh; native builds copy photos into app documents.
export async function keepPhoto(_uri: string, base64: string, _id: string) { return 'data:image/jpeg;base64,' + base64; }
