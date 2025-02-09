export interface ResponseHTTP<T> {
    status?: number;
    message?: string;
    headers?: any;
    data: T;
}