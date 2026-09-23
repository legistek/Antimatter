import * as React from "react";
import { Binding } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "./Control";
import { WebStyle } from "../Style";
import { StackPanel } from "./StackPanel";
import { TextBlock } from "./TextBlock";
import { FontStyle, SemanticColor, ThemeLayout } from "../Theme";

export interface IMentionPickerItemProps extends IControlProps {
  PrimaryText?: string | Binding;
  SecondaryText?: string | Binding;
}

export class MentionPickerItem extends Control<
  IMentionPickerItemProps,
  IControlState
> {
  public get PrimaryText(): string | undefined {
    return this.GetValue(nameof(this.props.PrimaryText));
  }

  public get SecondaryText(): string | undefined {
    return this.GetValue(nameof(this.props.SecondaryText));
  }

  static DefaultStyle = new WebStyle<IMentionPickerItemProps>(
    { Padding: ThemeLayout.MarginSmallLTRB },
    {
      "@": {
        cursor: "pointer",
        userSelect: "none",
      },
    },
  );

  protected override renderElement(): JSX.Element | null {
    return (
      <StackPanel>
        <TextBlock
          FontWeight="bold"
          Foreground={SemanticColor.BodyText}
          Text={this.PrimaryText}
          MaxLines="1"
          ToolTip={this.PrimaryText}
        />
        {this.SecondaryText !== undefined && (
          <TextBlock
            Foreground={SemanticColor.DisabledBodyText}
            FontSize={FontStyle.Small}
            Text={this.SecondaryText}
            MaxLines="1"
            ToolTip={this.SecondaryText}
          />
        )}
      </StackPanel>
    );
  }
}