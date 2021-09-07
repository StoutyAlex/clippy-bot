import { ClippyApiStackProps } from "./clippy-stack";

const buildName = (stage: string, name: ClippyApiStackProps['stage']) => {
    if (stage === 'dev' || stage === 'prod') {
        return `clippy-${name}`
    }
    return `clippy-${stage}-${name}`
}

export { buildName };