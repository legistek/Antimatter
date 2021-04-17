import { BindingExpression } from "../BindingExpression";
import { BindingSource } from "../BindingSource";

export class DependencyBindingExpression extends BindingExpression
{
    protected /* override */ ApplyInternal(): void
    {
        //console.log("Dependency Binding Applied");
        //if (!this._source)
        //{
        //    // source must be DataContext
        //    var dctx = this._target.DataContext;
        //    if (dctx)
        //    {
        //        this._resolvedSource = new BindingSource(dctx);
        //    }
        //    else
        //    {
        //        return;
        //    }
        //}
    }
}