export class ModelValue
{
    Type?: ModelValueType;
    StringValue?: string;
    ObjectHandle?: number;
    FloatValue?: number;
    DoubleValue?: number;
    IntValue?: number;
    LongValue?: number;

    public static Get(jsValue: any): ModelValue
    {
        const val: ModelValue = new ModelValue;

        if (jsValue?.IsModelObjectReference)
        {
            val.Type = ModelValueType.ObjectHandle;
            val.ObjectHandle = jsValue.Handle;
        }
        else
        {
            switch (typeof jsValue)
            {
                case "undefined":
                    val.Type = ModelValueType.None;
                    break;
                case "number":
                    val.Type = ModelValueType.Long;
                    val.LongValue = jsValue;
                    break;
                case "string":
                    val.Type = ModelValueType.String;
                    val.StringValue = jsValue;
                    break;
            }
        }

        return val;
    }
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