// El control segmentado es nativo en iOS; en tests se reemplaza por pestañas
// tocables con role "tab" para poder probar la seleccion.
const React = require('react');
const { Pressable, Text, View } = require('react-native');

function SegmentedControl({ values = [], selectedIndex = -1, onChange, onValueChange }) {
  return React.createElement(
    View,
    { accessibilityRole: 'tablist' },
    values.map((label, i) =>
      React.createElement(
        Pressable,
        {
          key: label,
          accessibilityRole: 'tab',
          accessibilityLabel: label,
          accessibilityState: { selected: i === selectedIndex },
          onPress: () => {
            onChange && onChange({ nativeEvent: { selectedSegmentIndex: i, value: label } });
            onValueChange && onValueChange(label);
          },
        },
        React.createElement(Text, null, label),
      ),
    ),
  );
}

module.exports = SegmentedControl;
module.exports.default = SegmentedControl;
