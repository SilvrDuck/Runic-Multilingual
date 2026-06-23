import "./index.css";

import { h, Component } from "preact";

interface Props extends preact.JSX.HTMLAttributes {
    label: string;
    bindInput?: (text: string) => void;
}

interface State {}

export class TextInput extends Component<Props, State> {
    textareaElement?: HTMLTextAreaElement;

    setText(text: string) {
        this.textareaElement.value = text;
        this.onInput();
    }

    private updateRows() {
        const value = this.textareaElement.value;
        // Determine the number of lines, +1 to show it can be multiline
        const numLines = (value.match(/\n/g) || []).length + 1;
        this.textareaElement.rows = numLines + 1;
    }

    onInput = () => {
        const value = this.textareaElement.value;

        // Pass it to the prop
        this.props.bindInput?.(value);

        this.updateRows();
    };

    componentDidMount() {
        // The textarea is uncontrolled: apply the initial `value` once here so
        // that later parent re-renders (e.g. language switch) don't clobber the
        // user's text or values pushed in via setText().
        if (this.props.value != null) {
            this.textareaElement.value = String(this.props.value);
        }
        this.updateRows();
    }

    render(props: Props, state: State) {
        // `value` is intentionally pulled out so it is NOT spread onto the
        // textarea as a controlled prop (see componentDidMount).
        const { label, bindInput, value, ...otherAttrs } = props;
        return (
            <div className="text-input">
                <label className="text-input__label">{label}:</label>
                <textarea
                    ref={(e) => (this.textareaElement = e)}
                    className="text-input__textarea"
                    {...(otherAttrs as any)}
                    onInput={this.onInput}
                    // 2 so that the user understands you can
                    rows={2}
                ></textarea>
            </div>
        );
    }
}
