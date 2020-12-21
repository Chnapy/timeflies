export type TimePartialProps = {
    duration: number;
};

export type TimeFullProps = TimePartialProps & {
    startTime: number;
};

export type TimeProps = TimePartialProps & Partial<TimeFullProps>;
