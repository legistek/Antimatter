import React from "react";
import { Binding } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "./Control";
import { WebStyle } from "../Style";

export interface MentionContentProps extends IControlProps {
  Text?: string | Binding;
}

export class MentionContent extends Control<
  MentionContentProps,
  IControlState
> {
  static DefaultBindings = {
    Text: {},
  };

  static DefaultStyle = new WebStyle<MentionContentProps>(
    {},
    {
      "@ a": {
        backgroundColor: "rgba(0, 120, 212, 0.1)",
        color: "#0054a0",
        borderRadius: "3px",
        padding: "1px 3px",
        textDecoration: "none",
        fontWeight: "bold",
        cursor: "default",
      },
      "@ a:hover": {
        backgroundColor: "rgba(0, 120, 212, 0.2)",
      },
    },
  );

  public get Text(): string {
    return this.GetValue(nameof(this.props.Text)) ?? "";
  }

  protected override renderElement(): JSX.Element | null {
    // Strip contenteditable="false" — valid inside a contentEditable editor
    // but misleading in a read-only display context.
    const html = this.Text.replace(/ contenteditable="false"/g, "");

    return (
      <span
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}