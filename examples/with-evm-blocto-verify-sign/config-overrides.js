module.exports = function override(config, env) {
    config.resolve.fallback = {
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify'),
    };

    return config;
};
