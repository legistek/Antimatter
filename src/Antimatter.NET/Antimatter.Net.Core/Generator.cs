using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

using Antimatter.Net.Model;

namespace Antimatter.Net
{
    //public class TypescriptPropertyTypeAttribute : Attribute
    //{
    //    public TypescriptPropertyTypeAttribute(string typescriptType)
    //    {
    //        this.TypescriptType = typescriptType;
    //    }

    //    public string TypescriptType { get; set; }
    //}

    public class TypescriptGenerator
    {
        public void Generate(Type[] rootTypes, StreamWriter dtsWriter, StreamWriter tsWriter = null)
        {
            foreach (var type in rootTypes)
                GenerateTS(type, dtsWriter, tsWriter);
            GenerateDependencies(dtsWriter, tsWriter);
        }

        public void Generate(Type rootType, StreamWriter sw, StreamWriter tsWriter = null)
        {
            GenerateTS(rootType, sw, tsWriter);
            GenerateDependencies(sw, tsWriter);
        }

        public void Generate(Assembly asm, StreamWriter sw, StreamWriter tsWriter = null)
        {
            var tsTypes = asm.GetTypes().Where(t => t.GetCustomAttribute<AntimatterModelAttribute>() != null);
            foreach (var type in tsTypes)
                GenerateTS(type, sw, tsWriter);
            GenerateDependencies(sw, tsWriter);
        }

        HashSet<Type> _doneTypes = new HashSet<Type>();
        internal HashSet<Type> _needTypes = new HashSet<Type>();

        internal void GenerateDependencies(StreamWriter sw, StreamWriter tsWriter = null)
        {
            while (_needTypes.Count > 0)
            {
                GenerateTS(_needTypes.First(), sw, tsWriter);
            }
        }

        internal void GenerateTS(Type type, StreamWriter sw, StreamWriter tsWriter)
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
                GenerateEnumType(type, sw, false);
                if (tsWriter != null)
                    GenerateEnumType(type, tsWriter, true);
                return;
            }

            sw.WriteLine($"export class {type.Name.Replace('`', '_')} {{");

            // get every property and field
            var allProps = type.GetRuntimeProperties();
            //var fields = type.GetRuntimeFields();

            HashSet<string> names = new HashSet<string>();

            foreach (var prop in allProps)
            {
                var propAttr = prop.GetCustomAttribute<AntimatterModelAttribute>();
                if (propAttr?.Ignore == true)
                    continue;

                if (!(prop.GetAccessors(false)?.Length > 0) && propAttr == null)
                    continue;   // no public getters
                if (prop.PropertyType.IsGenericType &&
                    Nullable.GetUnderlyingType(prop.PropertyType) == null &&
                    !typeof(IEnumerable).IsAssignableFrom(prop.PropertyType))
                    continue;   // we don't do generics yet
                if (typeof(Tuple).IsAssignableFrom(prop.PropertyType))
                    continue;
                string name = GetPropName(prop, genAttr);
                if (string.IsNullOrEmpty(name) || names.Contains(name))
                    continue;

                sw.WriteLine($"\tpublic {name}?: {GetPropType(prop)};");
                names.Add(name);
            }

            sw.WriteLine("}\r\n");

            _doneTypes.Add(type);
            _needTypes.Remove(type);
        }

        protected virtual string GetPropType(PropertyInfo pi)
        {
            var tg = pi.GetCustomAttribute<AntimatterModelAttribute>();
            if (tg != null && !string.IsNullOrEmpty(tg.TypescriptType))
                return tg.TypescriptType;
            return CSTypeToTSType(pi.PropertyType);
        }

        protected virtual string GetPropName(PropertyInfo prop, AntimatterModelAttribute attr)
        {
            return prop.Name;
        }

        private string CSTypeToTSType(Type csType)
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
                csType == typeof(ulong) ||
                csType == typeof(int?) ||
                csType == typeof(uint?) ||
                csType == typeof(float?) ||
                csType == typeof(double?) ||
                csType == typeof(short?) ||
                csType == typeof(ushort?) ||
                csType == typeof(byte?) ||
                csType == typeof(long?) ||
                csType == typeof(ulong?) )
                baseType = "number";
            else if (csType == typeof(string) ||
                csType == typeof(Guid))
                baseType = "string";
            else if (csType == typeof(bool))
                baseType = "boolean";
            else if (csType == typeof(bool?))
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
                else if (csType.IsArray)
                {
                    baseType = CSTypeToTSType(csType.GetElementType());
                }
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

            baseType = baseType.Replace('`', '_');

            if (array)
                return baseType + "[]";
            else
                return baseType;
        }

        private void GenerateEnumType(Type type, StreamWriter sw, bool forNames)
        {
            sw.WriteLine($"export enum {type.Name} {{");

            Type ut = Enum.GetUnderlyingType(type);
            var names = type.GetEnumNames();
            var vals = type.GetEnumValues().Cast<Enum>();
            for (int i = 0; i < names.Length; i++)
            {
                if (!forNames)
                {
                    sw.WriteLine($"\t{names[i]} = {Convert.ChangeType(vals.ElementAt(i), ut)},");
                }
                else
                {
                    sw.WriteLine($"\t{names[i]} = \"{type.Name}.{names[i]}\",");
                }
            }

            sw.WriteLine("}\r\n");

            if (!forNames)
            {
                _doneTypes.Add(type);
                _needTypes.Remove(type);
            }
        }
    }
}
