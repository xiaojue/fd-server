exports.name = 'fd';
exports.version = '0.1';

exports.filters = {
  enabled: function(writers, name) {
    return writers.filter(function(writer) {
      return ~writer.indexOf(name)
    }).length;
  }
};
