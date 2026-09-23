export class UploadFileArgs
{
    public FileHandle?: number;

    public Start?: number;

    public Length?: number;

    public Url?: string;

    public Method?: string;

    public Headers: {
        [key: string]: string
    } = {}    
}