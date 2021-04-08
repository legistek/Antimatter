using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Antimatter.Net
{
    public class TypescriptGenerator
    {
        public static void Generate(Assembly asm, StreamWriter sw)
        {
            var tsTypes = asm.GetTypes().Where(t => t.GetCustomAttribute<AntimatterModelAttribute>() != null);
            foreach (var type in tsTypes)
                GenerateTS(type, sw);
            GenerateDependencies(sw);
        }

        static HashSet<Type> _doneTypes = new HashSet<Type>();
        internal static HashSet<Type> _needTypes = new HashSet<Type>();

        internal static void GenerateDependencies(StreamWriter sw)
        {
            while (_needTypes.Count > 0)
            {
                GenerateTS(_needTypes.First(), sw);
            }
        }

        internal static void GenerateTS(Type type, StreamWriter sw)
        {
            AntimatterModelAttribute genAttr;
            if ((genAttr = type.GetCustomAttribute<AntimatterModelAttribute>()) != null &&
                !string.IsNullOrEmpty(genAttr.TypescriptType))
                // It's explicitly specified so we don't generate it ourselves
                return;

            if (_doneTypes.Contains(type))
                return;

            if (type.IsEnum)
            {
                GenerateEnumType(type, sw);
                return;
            }

            sw.WriteLine($"export class {type.Name} {{");

            // get every property and field
            var allProps = type.GetRuntimeProperties();
            var fields = type.GetRuntimeFields();
                       
            foreach (var prop in allProps)
            {                    
                if (!(prop.GetAccessors(false)?.Length > 0))
                    continue;   // no public getters
                sw.WriteLine($"\tpublic {prop.Name}?: {CSTypeToTSType(prop.PropertyType)};");
            }            
            
            sw.WriteLine("}\r\n");

            _doneTypes.Add(type);
            _needTypes.Remove(type);
        }

        private static string CSTypeToTSType(Type csType)
        {
            csType = Nullable.GetUnderlyingType(csType) ?? csType;

            string baseType = null;
            bool array = false;

            AntimatterModelAttribute tsGenAttr = null;

            if (csType == typeof(int) ||
                csType == typeof(uint) ||
                csType == typeof(float) ||
                csType == typeof(double) ||
                csType == typeof(short) ||
                csType == typeof(ushort) ||
                csType == typeof(byte) ||
                csType == typeof(long) ||
                csType == typeof(ulong))
                baseType = "number";
            else if (csType == typeof(string) ||
                csType == typeof(Guid))
                baseType = "string";
            else if (csType == typeof(bool))
                baseType = "boolean";
            else if (csType == typeof(DateTime) ||
                csType == typeof(TimeSpan))
                baseType = "Date";
            else if (csType == typeof(object))
                baseType = "any";
            else if (typeof(IEnumerable).IsAssignableFrom(csType))
            {
                array = true;
                if (csType.IsGenericType)
                    baseType = CSTypeToTSType(csType.GenericTypeArguments.First());
                else
                    return "any[]";
            }
            else if ((tsGenAttr = csType.GetCustomAttribute<AntimatterModelAttribute>()) != null &&
                     !string.IsNullOrEmpty(tsGenAttr.TypescriptType))
            {
                return tsGenAttr.TypescriptType;
            }
            else
            {
                baseType = csType.Name;
                if (!_doneTypes.Contains(csType))
                    _needTypes.Add(csType);
            }

            if (array)
                return baseType + "[]";
            else
                return baseType;
        }

        private static void GenerateEnumType(Type type, StreamWriter sw)
        {
            sw.WriteLine($"export enum {type.Name} {{");

            Type ut = Enum.GetUnderlyingType(type);
            var names = type.GetEnumNames();
            var vals = type.GetEnumValues().Cast<Enum>();
            for (int i = 0; i < names.Length; i++)
            {
                sw.WriteLine($"\t{names[i]} = {Convert.ChangeType(vals.ElementAt(i), ut)},");
            }

            sw.WriteLine("}\r\n");

            _doneTypes.Add(type);
            _needTypes.Remove(type);
        }
    }
}
