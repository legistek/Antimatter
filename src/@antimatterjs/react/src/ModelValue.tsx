import { Utilities } from "@antimatterjs/react/src/Utilities";
import { Antimatter } from "..";
import { Rect, Size } from "./Foundation";
import { MultimediaEvent } from "./MultimediaEvent";

export class ModelValue
{
    Type?: ModelValueType;
    StringValue?: string;
    Key?: string;
    ObjectHandle?: number;
    ShortValue?: number;
    FloatValue?: number;
    FloatValue2?: number;
    FloatValue3?: number;
    FloatValue4?: number;
    DoubleValue?: number;
    IntValue?: number;
    Collection?: ModelValue[];
    BoolValue?: boolean;

    public static Get(jsValue: any, modelType?: ModelValueType): ModelValue
    {
        const val: ModelValue = new ModelValue;

        if (modelType)
        {

        }
        else if (jsValue instanceof MultimediaEvent)
        {
            val.Type = ModelValueType.MultimediaEvent;
            val.ShortValue = jsValue.type as number;
            val.DoubleValue = jsValue.timestamp;
            val.FloatValue3 = jsValue.other1;
            val.FloatValue4 = jsValue.other2;            
        }
        else if (jsValue instanceof Date)
        {
            val.Type = ModelValueType.DateTime;
            val.DoubleValue = Utilities.TicksMSFromDate(jsValue);
        }
        else if (jsValue instanceof File)
        {
            var file = jsValue as File;
            val.Type = ModelValueType.ClientFile;
            val.StringValue = JSON.stringify(Antimatter.HoldFile(file));
        }
        else if (jsValue instanceof Size)
        {
            val.Type = ModelValueType.Size;
            val.FloatValue = jsValue.Width;
            val.FloatValue2 = jsValue.Height;
        }
        else if (jsValue instanceof Rect)
        {
            val.Type = ModelValueType.Rect;
            val.FloatValue = jsValue.X;
            val.FloatValue2 = jsValue.Y;
            val.FloatValue3 = jsValue.Width;
            val.FloatValue4 = jsValue.Height;
        }
        else
        {
            switch (typeof jsValue)
            {
                case "undefined":
                    val.Type = ModelValueType.Null;
                    break;
                case "boolean":
                    val.Type = ModelValueType.Bool;
                    val.BoolValue = jsValue;
                    break;
                case "number":
                    if (Number.isInteger(jsValue))
                    {
                        val.Type = ModelValueType.Int;
                        val.IntValue = jsValue;
                    }
                    else
                    {
                        val.Type = ModelValueType.Float;
                        val.FloatValue = jsValue;
                    }                    
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
                    else if (Utilities.IsIterable(jsValue))
                    {
                        val.Type = ModelValueType.Collection;
                        var iter = jsValue as IterableIterator<any>;                        
                        val.ObjectHandle = jsValue.AMXModelObjectHandle;    // if it came from model originally
                        if (val.ObjectHandle === undefined) // no need to re-send the original collection if it's already model side
                            val.Collection = Array.from(iter).map(item => this.Get(item));
                    }
                    else
                    {
                        val.Type = ModelValueType.MarshalledObject;
                        val.StringValue = JSON.stringify(jsValue);
                    }
                    break;
            }
        }

        return val;
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
            case ModelValueType.Double:
                return this.DoubleValue?.toString() || "";
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
    //Long = 4,
    Float = 5,
    Double = 6,
    Collection = 7,
    Bool = 8,
    Guid = 9,
    DateTime = 10,
    TimeSpan = 11,
    MarshalledObject = 12,
    Size = 13,
    Rect = 14,
    ClientFile = 15,
    MultimediaEvent = 16,
    ValidationError = 17,
    CollectionReference = 18,

    // Only used internally
    Any = 65535
}