declare const base: {
  coverage: {
    provider: 'v8';
    reporter: Array<'text' | 'lcov' | 'html'>;
    reportsDirectory: string;
    include: string[];
    exclude: string[];
  };
};

export = base;
