export class ModelValue
{
    Type?: ModelValueType;
    StringValue?: string;
    ObjectHandle?: number;
    FloatValue?: number;
    DoubleValue?: number;
    IntValue?: number;
    LongValue?: number;
}

export enum ModelValueType 
{
    None = 0,
    ObjectHandle = 1,
    String = 2,
    Int = 3,
    Long = 4,
    Float = 5,
    Double = 6,
}