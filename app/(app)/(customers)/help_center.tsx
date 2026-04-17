import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockFAQ, chatbotResponses } from '../../../src/infrastructure/mock/mockData';
import Colors from '../../../constants/Colors';
import Theme from '../../../constants/Theme';
import { Card } from '../../../components/ui/Card';

type ChatMessage = { id: string; text: string; isBot: boolean; timestamp: Date };

function findBotResponse(input: string): string {
  const q = input.toLowerCase();
  for (const { triggers, response } of chatbotResponses) {
    if (triggers.some(t => q.includes(t))) return response;
  }
  return 'Hmm, no estoy seguro de eso. ¿Podrías reformular tu pregunta? Si necesitas ayuda urgente, crea un ticket de soporte.';
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  return (
    <View style={[styles.bubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
      {msg.isBot && (
        <View style={styles.botIcon}>
          <MaterialCommunityIcons name="robot-outline" size={14} color={Colors.primary} />
        </View>
      )}
      <View style={[styles.bubbleContent, msg.isBot ? styles.botContent : styles.userContent]}>
        <Text style={[styles.bubbleText, msg.isBot ? styles.botText : styles.userText]}>{msg.text}</Text>
      </View>
    </View>
  );
}

function FAQItem({ item }: { item: typeof mockFAQ[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity onPress={() => setOpen(v => !v)} style={styles.faqItem} activeOpacity={0.8}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{item.question}</Text>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
      </View>
      {open && <Text style={styles.faqA}>{item.answer}</Text>}
    </TouchableOpacity>
  );
}

type HelpTab = 'faq' | 'chat' | 'ticket';

export default function HelpScreen() {
  const [tab, setTab] = useState<HelpTab>('faq');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', text: '¡Hola! Soy TIVO AI, tu asistente virtual. ¿En qué puedo ayudarte?', isBot: true, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Ticket form
  const [ticketType, setTicketType] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), text: input, isBot: false, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

    const response = findBotResponse(userMsg.text);
    setIsTyping(false);
    setMessages(m => [...m, { id: (Date.now() + 1).toString(), text: response, isBot: true, timestamp: new Date() }]);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const TABS: { key: HelpTab; label: string; icon: string }[] = [
    { key: 'faq', label: 'FAQ', icon: 'frequently-asked-questions' },
    { key: 'chat', label: 'Chatbot', icon: 'robot-outline' },
    { key: 'ticket', label: 'Soporte', icon: 'ticket-outline' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Centro de Ayuda</Text>
        <MaterialCommunityIcons name="lifebuoy" size={24} color={Colors.primary} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <MaterialCommunityIcons name={t.icon as any} size={16} color={tab === t.key ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ */}
      {tab === 'faq' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Preguntas frecuentes</Text>
          {mockFAQ.map(item => <FAQItem key={item.id} item={item} />)}
        </ScrollView>
      )}

      {/* Chat */}
      {tab === 'chat' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
            {isTyping && (
              <View style={[styles.bubble, styles.botBubble]}>
                <View style={styles.botIcon}>
                  <MaterialCommunityIcons name="robot-outline" size={14} color={Colors.primary} />
                </View>
                <View style={[styles.bubbleContent, styles.botContent]}>
                  <Text style={styles.botText}>Escribiendo...</Text>
                </View>
              </View>
            )}
          </ScrollView>
          {/* Quick replies */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickReplies}>
            {['Cómo vender', 'Ajustar stock', 'Ver reportes', 'Agregar cliente'].map(q => (
              <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => { setInput(q); }}>
                <Text style={styles.quickBtnText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.chatInput}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor={Colors.textMuted}
              style={styles.chatTextField}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, !input && styles.sendBtnOff]}>
              <MaterialCommunityIcons name="send" size={20} color={input ? Colors.white : Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Ticket */}
      {tab === 'ticket' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {ticketSent ? (
            <View style={styles.ticketSuccess}>
              <MaterialCommunityIcons name="check-circle" size={56} color={Colors.accent} />
              <Text style={styles.successTitle}>¡Ticket enviado!</Text>
              <Text style={styles.successSub}>Nuestro equipo te responderá en menos de 24 horas.</Text>
              <TouchableOpacity onPress={() => setTicketSent(false)} style={styles.newTicketBtn}>
                <Text style={styles.newTicketText}>Crear otro ticket</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Card style={{ gap: 16 }}>
              <Text style={styles.sectionLabel}>Nuevo ticket de soporte</Text>
              <View>
                <Text style={styles.inputLabel}>Tipo de problema</Text>
                <View style={styles.typeRow}>
                  {['Error técnico', 'Duda de uso', 'Sugerencia', 'Otro'].map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeChip, ticketType === t && styles.typeChipActive]}
                      onPress={() => setTicketType(t)}
                    >
                      <Text style={[styles.typeLabel, ticketType === t && styles.typeLabelActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  value={ticketDesc}
                  onChangeText={setTicketDesc}
                  placeholder="Describe el problema con el mayor detalle posible..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  style={styles.textArea}
                />
              </View>
              <TouchableOpacity
                style={[styles.submitBtn, (!ticketType || !ticketDesc) && styles.submitBtnOff]}
                onPress={() => { if (ticketType && ticketDesc) setTicketSent(true); }}
              >
                <MaterialCommunityIcons name="send" size={18} color={Colors.white} />
                <Text style={styles.submitLabel}>Enviar ticket</Text>
              </TouchableOpacity>
            </Card>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md },
  title: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Theme.spacing.md,
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.lg,
    padding: 4,
    marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: Theme.radius.md },
  tabBtnActive: { backgroundColor: Colors.primaryBg },
  tabLabel: { fontSize: Theme.font.sizes.xs, color: Colors.textMuted, fontWeight: Theme.font.weights.medium },
  tabLabelActive: { color: Colors.primary, fontWeight: Theme.font.weights.semibold },
  content: { padding: Theme.spacing.md, gap: 8 },
  sectionLabel: { fontSize: Theme.font.sizes.xs, fontWeight: Theme.font.weights.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  faqItem: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Theme.radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  faqQ: { flex: 1, fontSize: Theme.font.sizes.sm, fontWeight: Theme.font.weights.semibold, color: Colors.textPrimary, lineHeight: 20 },
  faqA: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary, marginTop: 10, lineHeight: 20 },
  // Chat
  chatContent: { padding: 12, gap: 12, paddingBottom: 4 },
  bubble: { flexDirection: 'row', gap: 8, maxWidth: '85%' },
  botBubble: { alignSelf: 'flex-start', alignItems: 'flex-end' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4, flexShrink: 0,
  },
  bubbleContent: { borderRadius: Theme.radius.lg, padding: 12, maxWidth: '100%' },
  botContent: { backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  userContent: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: Theme.font.sizes.sm, lineHeight: 20 },
  botText: { color: Colors.textPrimary },
  userText: { color: Colors.white },
  quickReplies: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  quickBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.primaryBg,
    borderRadius: Theme.radius.full,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  quickBtnText: { fontSize: Theme.font.sizes.xs, color: Colors.primary, fontWeight: Theme.font.weights.medium },
  chatInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  chatTextField: {
    flex: 1, fontSize: Theme.font.sizes.sm, color: Colors.textPrimary,
    backgroundColor: Colors.bgOverlay,
    borderRadius: Theme.radius.full,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Theme.shadow.primary,
  },
  sendBtnOff: { backgroundColor: Colors.bgOverlay, shadowOpacity: 0 },
  // Ticket
  inputLabel: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary, fontWeight: Theme.font.weights.medium, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Theme.radius.full, backgroundColor: Colors.bgOverlay, borderWidth: 1, borderColor: Colors.border },
  typeChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  typeLabel: { fontSize: Theme.font.sizes.xs, color: Colors.textSecondary },
  typeLabelActive: { color: Colors.primary, fontWeight: Theme.font.weights.semibold },
  textArea: {
    backgroundColor: Colors.bgOverlay, borderRadius: Theme.radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: 14, fontSize: Theme.font.sizes.sm, color: Colors.textPrimary,
    minHeight: 120,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Theme.radius.md, padding: 16,
    ...Theme.shadow.primary,
  },
  submitBtnOff: { backgroundColor: Colors.bgOverlay, shadowOpacity: 0 },
  submitLabel: { fontSize: Theme.font.sizes.base, fontWeight: Theme.font.weights.bold, color: Colors.white },
  ticketSuccess: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  successTitle: { fontSize: Theme.font.sizes.xl, fontWeight: Theme.font.weights.bold, color: Colors.textPrimary },
  successSub: { fontSize: Theme.font.sizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  newTicketBtn: { marginTop: 8, padding: 12 },
  newTicketText: { fontSize: Theme.font.sizes.sm, color: Colors.primary, fontWeight: Theme.font.weights.semibold },
});
