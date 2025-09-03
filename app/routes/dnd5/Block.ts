export type Block = {
    id: string;
    text?: string;
    parentId: string;
    children: Block[];
    type: 'container' | 'text' | 'image';
};


