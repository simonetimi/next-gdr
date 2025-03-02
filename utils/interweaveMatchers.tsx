import { Matcher, MatchResponse, Node, ChildrenNode } from "interweave";

interface Options {
  className?: string;
}

interface Props {
  children: string;
}

export const generateMatchers = (wordMatcherTerm: string) => {
  // matchers to customize dialogs and tags in some location messages
  const guillemetMatcher = new GuillemetMatcher("guillemet", {
    className: "font-semibold italic text-foreground dark:text-foreground-800",
  });
  const squareBracketsMatcher = new BracketMatcher("bracket", {
    className: "font-bold text-foreground dark:text-white",
  });
  const wordmatcher = new WordMatcher(wordMatcherTerm, {
    className: "font-semibold text-primary-500",
  });
  return { guillemetMatcher, squareBracketsMatcher, wordmatcher };
};

export class GuillemetMatcher extends Matcher<Props> {
  options: Options;

  constructor(name: string, options: Options = {}) {
    super(name);
    this.options = options;
  }

  match(string: string): MatchResponse<Props> | null {
    const result = string.match(/«([^»]+)»/);
    if (!result) {
      return null;
    }
    return {
      index: result.index!,
      length: result[0].length,
      match: result[0],
      children: result[1],
      valid: true,
    };
  }

  replaceWith(children: ChildrenNode, props: Props): Node {
    return (
      <span
        key={`guillemet-${props.children.substring(0, 10)}-${Date.now()}`}
        className={this.options.className}
      >
        {children}
      </span>
    );
  }

  asTag(): string {
    return "span";
  }
}

export class BracketMatcher extends Matcher<Props> {
  options: Options;

  constructor(name: string, options: Options = {}) {
    super(name);
    this.options = options;
  }

  match(string: string): MatchResponse<Props> | null {
    const result = string.match(/\[([^\]]+)\]/);
    if (!result) {
      return null;
    }
    return {
      index: result.index!,
      length: result[0].length,
      match: result[0],
      children: result[1],
      valid: true,
    };
  }

  replaceWith(children: ChildrenNode, props: Props): Node {
    return (
      <span
        key={`bracket-${props.children.substring(0, 10)}-${Date.now()}`}
        className={this.options.className}
      >
        {children}
      </span>
    );
  }

  asTag(): string {
    return "span";
  }
}

export class WordMatcher extends Matcher<Props> {
  targetWord: string;
  options: Options;

  constructor(name: string, options: Options = {}) {
    super(name);
    this.targetWord = name;
    this.options = options;
  }

  match(string: string): MatchResponse<Props> | null {
    const regex = new RegExp(`\\b${this.targetWord}\\b`, "g");
    const result = regex.exec(string);
    if (!result) {
      return null;
    }
    return {
      index: result.index,
      length: result[0].length,
      match: result[0],
      children: result[0],
      valid: true,
    };
  }

  replaceWith(children: ChildrenNode, props: Props): Node {
    return (
      <span
        key={`word-${props.children}-${Date.now()}`}
        className={this.options.className}
      >
        {children}
      </span>
    );
  }

  asTag(): string {
    return "span";
  }
}
