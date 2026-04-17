import React, { useRef } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Theme from '../../constants/Theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onCameraPress?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export function SearchBar({
  value, onChangeText, placeholder = 'Buscar productos...', onCameraPress, style, autoFocus,
}: SearchBarProps) {
  const ref = useRef<TextInput>(null);

  return (
    <View style={[styles.wrapper, style]}>
      <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} style={styles.searchIcon} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.iconBtn}>
          <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      ) : onCameraPress ? (
        <TouchableOpacity onPress={onCameraPress} style={styles.iconBtn}>
          <MaterialCommunityIcons name="barcode-scan" size={20} color={Colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgOverlay,
    borderRadius: Theme.radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: Theme.font.sizes.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  iconBtn: { padding: 4 },
});
