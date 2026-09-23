using Antimatter.Net;
using Antimatter.Net.Model;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Windows.Input;

namespace AntimatterJS.Sample.AppModel
{

    public class Size
    {
        public double Width { get; set; }
        public double Height { get; set; }
    }


    public class HoboContext
    {
        public int Handle { get; set; }
    }

    public class HoboContextConverter : IModelValueConverter
    {
        public Type TargetType => typeof(HoboContext);

        public object ConvertFrom(object value)
        {
            if (!(value is IConvertible iconv))
                return null;            
            return new HoboContext
            {
                Handle = iconv.ToInt32(CultureInfo.CurrentCulture)
            };
        }

        public object ConvertTo(object obj)
        {
            if (!(obj is HoboContext ctx))
                return null;
            return ctx.Handle;
        }
    }

    public class Drawing : ObservableObject
    {
        #region IUICommand Render Command

        private Command<int> _RenderCommand;
        public ICommand RenderCommand
        {
            get
            {
                return _RenderCommand ?? (_RenderCommand = new Command<int>(
                    (ctx) =>
                    {
                        var reactor = Antimatter.Net.Reactor.GetFor(this, out _);

                        var sz = reactor.InvokeClientMethod(
                            "window.AmxDrawingSurface.GetSize",
                            new
                            {
                                handle = ctx,
                            });


                        if (!(sz is System.Drawing.SizeF size))
                            return;

                        var a = reactor.InvokeClientMethod(
                            "window.AmxDrawingSurface.AppendInnerHtml",
                            new
                            {
                                handle = ctx,
                                innerHTML = @"<circle cx=""50"" cy=""50"" r=""40"" stroke=""green"" stroke-width=""4"" fill=""yellow"" />"
                            });

                        //var a = reactor.InvokeClientMethod(
                        //    "window.AmxDrawingSurface.DrawRect",
                        //    new
                        //    {
                        //        handle = ctx.Handle,
                        //        x = 10,
                        //        y = 10,
                        //        width = size.Width - 20,
                        //        height = size.Height - 20,
                        //        borderWidth = 2,
                        //        borderColor = "#00FF00",
                        //        //fill = "#FF00FF"
                        //    });

                        //var b = reactor.InvokeClientMethod(
                        //    "window.AmxDrawingSurface.DrawLine",
                        //    new
                        //    {
                        //        handle = ctx.Handle,
                        //        x1 = 0,
                        //        y1 = 0,
                        //        x2 = size.Width,
                        //        y2 = size.Height,
                        //        thickness = 5,
                        //        color = "#FF0000"
                        //    });

                        //var c = reactor.InvokeClientMethod(
                        //    "window.AmxDrawingSurface.DrawString",
                        //    new
                        //    {
                        //        handle = ctx.Handle,
                        //        x = 50,
                        //        y = 50,
                        //        fill = "#FFFFFF",
                        //        text = "Hobo!",
                        //        font = "bold 64px Times New Roman"
                        //    });

                    }));
            }
        }

        #endregion


    }
}
