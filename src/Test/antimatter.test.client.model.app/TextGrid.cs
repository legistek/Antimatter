using System;
using System.Collections.Generic;
using System.Text;

using System.Drawing;

using Antimatter.Net.Model;
using Antimatter.Net.Collections;

namespace AntimatterJS.Sample.AppModel
{
    public class TextLine : ObservableObject
    {
        public string Text { get; set; }
    }

    public class TextGrid : ObservableObject
    {
        Random _rand = new Random();

        public TextGrid()
        {
            int ct = _rand.Next(50, 1000);
            for (int i = 0; i < ct; i++)
            {
                var words = LoremNET.Lorem.Words(10, 15).Split(' ');
                StringBuilder sb = new StringBuilder();
                foreach (var word in words)
                {
                    sb.Append("<span>");
                    sb.Append(word + " ");
                    sb.Append("</span>");
                }
                Lines.Add(new TextLine
                {
                    Text = sb.ToString()
                });
            }
        }

        public ObservableList<TextLine> Lines { get; set; } = new ObservableList<TextLine>();

        #region RectangleF Selection property
        private RectangleF _Selection;
        public RectangleF Selection
        {
            get
            {
                return _Selection;
            }
            set
            {
                if (_Selection == value)
                    return;
                _Selection = value;
                OnPropertyChanged();
            }
        }
        #endregion
    }
}
