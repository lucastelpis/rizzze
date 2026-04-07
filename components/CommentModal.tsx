import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

interface CommentModalProps {
  isVisible: boolean;
  initialValue: string;
  onSave: (text: string) => void;
  onClose: () => void;
  title?: string;
}

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export function CommentModal({ isVisible, initialValue, onSave, onClose, title = "Sleep Note" }: CommentModalProps) {
  const { colors: C, isDark } = useTheme();
  const [text, setText] = useState(initialValue);
  const maxLength = 280;

  useEffect(() => {
    if (isVisible) {
      setText(initialValue);
    }
  }, [isVisible, initialValue]);

  const handleSave = () => {
    onSave(text.trim());
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable 
          style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(45,43,61,0.5)' }]} 
          onPress={onClose} 
        />
        
        <View style={[styles.content, { backgroundColor: C.bgCard }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <CloseIcon color={C.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Input Area */}
          <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <TextInput
              style={[styles.input, { color: C.textPrimary }]}
              placeholder="How was your sleep? Any thoughts?"
              placeholderTextColor={C.textMuted}
              multiline
              maxLength={maxLength}
              value={text}
              onChangeText={setText}
              autoFocus
              textAlignVertical="top"
            />
            <Text style={[styles.counter, { color: text.length >= maxLength ? C.danger : C.textMuted }]}>
              {text.length}/{maxLength}
            </Text>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.btn, styles.secondaryBtn]} 
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: C.textMuted }]}>Discard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, styles.primaryBtn, { backgroundColor: C.accent }]} 
              onPress={handleSave}
            >
              <Text style={[styles.btnText, styles.primaryBtnText]}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '90%',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    ...tokens.shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: tokens.fonts.heading,
    fontSize: 20,
  },
  closeBtn: {
    padding: 4,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
  },
  input: {
    flex: 1,
    fontFamily: tokens.fonts.body,
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 0,
  },
  counter: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    ...tokens.shadows.elevated,
  },
  secondaryBtn: {
    // Transparent or light
  },
  btnText: {
    fontFamily: tokens.fonts.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  primaryBtnText: {
    color: '#FFF',
  },
});
