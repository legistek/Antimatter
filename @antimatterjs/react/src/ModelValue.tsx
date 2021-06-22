import { Utilities } from "@antimatterjs/react/src/Utilities";

export class ModelValue
{
    Type?: ModelValueType;
    StringValue?: string;
    Key?: string;
    ObjectHandle?: number;
    FloatValue?: number;
    DoubleValue?: number;
    IntValue?: number;
    LongValue?: bigint;
    Collection?: ModelValue[];
    BoolValue?: boolean;

    public static Get(jsValue: any, modelType?: ModelValueType): ModelValue
    {
        const val: ModelValue = new ModelValue;

        if (modelType)
        {

        }
        else if (jsValue instanceof Date)
        {
            val.Type = ModelValueType.DateTime;
            val.LongValue = Utilities.TicksFromDate(jsValue);
        }
        else
        {
            switch (typeof jsValue)
            {
                case "undefined":
                    val.Type = ModelValueType.Null;
                    break;
                case "bigint":
                    val.Type = ModelValueType.Long;
                    val.LongValue = jsValue;
                    break;
                case "boolean":
                    val.Type = ModelValueType.Bool;
                    val.BoolValue = jsValue;
                    break;
                case "number":
                    val.Type = ModelValueType.Float;
                    val.FloatValue = jsValue;
                    break;
                case "string":
                    val.Type = ModelValueType.String;
                    val.StringValue = jsValue;
                    break;
                default:
                    if (jsValue === null)
                    {
                        val.Type = ModelValueType.Null;
                    }
                    else if (jsValue?.IsModelObjectReference)
                    {
                        val.Type = ModelValueType.ObjectHandle;
                        val.ObjectHandle = jsValue.Handle;
                    }
                    else if (this.IsIterable(jsValue))
                    {
                        val.Type = ModelValueType.Collection;
                        var iter = jsValue as IterableIterator<any>;
                        val.Collection = Array.from(iter).map(item => this.Get(item));
                    }
                    break;
            }
        }

        return val;
    }

    public static IsIterable(obj)
    {
        // checks for null and undefined
        if (obj == null)
        {
            return false;
        }
        return typeof obj[Symbol.iterator] === 'function';
    }

    public GetKey(): string
    {
        return this.ToString();
    }

    public ToString(): string
    {
        switch (this.Type)
        {
            case ModelValueType.ObjectHandle:
            case ModelValueType.Collection:
                return this.ObjectHandle?.toString() || "";
            case ModelValueType.String:
                return this.StringValue || "";
            case ModelValueType.Int:
                return this.IntValue?.toString() || "";
            case ModelValueType.Long:
                return this.LongValue?.toString() || "";
            case ModelValueType.Bool:
                return this.BoolValue?.toString() || "";
            default:
                return "";
        }
    }
}

export enum ModelValueType
{
    Null = 0,
    ObjectHandle = 1,
    String = 2,
    Int = 3,
    Long = 4,
    Float = 5,
    //Double = 6,
    Collection = 7,
    Bool = 8,
    Guid = 9,
    DateTime = 10,
    TimeSpan = 11,
    MarshalledObject = 12,


    ValidationError = 2147483647
}