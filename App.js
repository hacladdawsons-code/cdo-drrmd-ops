import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CloudRain,
  Lock,
  Mail,
  RotateCcw,
  Send,
  ShieldCheck,
  Waves
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { create } from 'zustand';

// ==========================================
// 1. THEME & CONFIGURATION
// ==========================================
const COLORS = {
  background: '#080c14', 
  surface: '#111827',    
  surfaceLight: '#1f2937',
  primary: '#2563eb',    
  primaryLight: '#3b82f6',
  success: '#10b981',    
  warning: '#f59e0b',    
  danger: '#ef4444',     
  text: '#ffffff',
  textMuted: '#9ca3af',
  border: '#374151',
};

const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
};

// ==========================================
// 2. BRAND LOGO (inline SVG)
// ==========================================
const AppLogo = ({ size = 96 }) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024">
    <Path
      d="M512 180 L780 300 V540 C780 700 660 820 512 880 C364 820 244 700 244 540 V300 Z"
      fill="none"
      stroke="#3b82f6"
      strokeWidth={28}
      strokeLinejoin="round"
    />
    <Path d="M400 560 Q512 460 624 560" fill="none" stroke="#3b82f6" strokeWidth={24} strokeLinecap="round"/>
    <Path d="M360 620 Q512 500 664 620" fill="none" stroke="#3b82f6" strokeWidth={20} strokeLinecap="round" opacity={0.8}/>
    <Path d="M320 680 Q512 540 704 680" fill="none" stroke="#10b981" strokeWidth={16} strokeLinecap="round" opacity={0.6}/>
    <Circle cx={512} cy={560} r={26} fill="#10b981" />
  </Svg>
);

// ==========================================
// 3. STATE MANAGEMENT (ZUSTAND)
// ==========================================
const useStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  login: (email) => set({ isAuthenticated: true, user: { email } }),
  logout: () => set({ isAuthenticated: false, user: null }),

  systemStatus: 'NORMAL', 
  isEvacuating: false,
  smsLogs: [],
  
  stations: [
    { id: '01', name: 'Ysalina Bridge Crossing', current: 2.10, baseline: 2.10, rise: 0.00, capacity: 42, status: 'NORMAL' },
    { id: '02', name: 'Balulang Riverbank Zone', current: 1.80, baseline: 1.80, rise: 0.00, capacity: 36, status: 'NORMAL' },
    { id: '03', name: 'Bitan-ag Drainage Basin', current: 0.90, baseline: 0.90, rise: 0.00, capacity: 18, status: 'NORMAL' },
  ],
  
  simulateRain: () => set((state) => ({
    systemStatus: 'ALERT', // Upgraded to ALERT to trigger emergency
    stations: state.stations.map(s => ({
      ...s,
      current: s.current + 0.8,
      rise: 0.80,
      capacity: s.capacity + 30,
      status: 'ALERT'
    }))
  })),

  resetNormal: () => set((state) => ({
    systemStatus: 'NORMAL',
    isEvacuating: false,
    smsLogs: [],
    stations: state.stations.map(s => ({
      ...s,
      current: s.baseline,
      rise: 0.00,
      capacity: s.baseline * 20, 
      status: 'NORMAL'
    }))
  })),

  triggerEvacuation: () => set({ isEvacuating: true }),
  
  addLog: (log) => set((state) => ({ 
    smsLogs: [...state.smsLogs, log] 
  })),

  clearLogs: () => set({ smsLogs: [] })
}));

// ==========================================
// 4. REUSABLE UI COMPONENTS
// ==========================================
const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry, icon: Icon }) => (
  <View style={styles.inputContainer}>
    {Icon && <Icon color={COLORS.textMuted} size={20} style={styles.icon} />}
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      style={styles.input}
      autoCapitalize="none"
    />
  </View>
);

const PrimaryButton = ({ title, onPress, icon: Icon, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
    {Icon && <Icon color={COLORS.text} size={20} style={{ marginLeft: 8 }} />}
  </TouchableOpacity>
);

// ==========================================
// 5. SCREENS
// ==========================================
const LoadingScreen = () => (
  <View style={styles.splashContainer}>
    <View style={styles.splashLogoWrap}>
      <AppLogo size={120} />
    </View>
    <Text style={styles.splashTitle}>CDO DRRMD OPS</Text>
    <Text style={styles.splashSubtitle}>LIVE TELEMETRY NODE v2.4</Text>
    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 32 }} />
    <Text style={styles.loadingText}>Initializing secure operations gateway...</Text>
    <Text style={styles.splashFooter}>CDRRMD · Cagayan de Oro City</Text>
  </View>
);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Readiness begins with reliable access.</Text>
          <Text style={styles.subtitle}>
            Authorized entry to live river and drainage telemetry, barangay evacuation protocols.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.cardLogoWrap}>
            <AppLogo size={56} />
          </View>

          <Text style={styles.formTitle}>Sign in to operations</Text>
          <Text style={styles.formSub}>Enter your credentials to access the network.</Text>
          
          <Text style={styles.label}>Operator email</Text>
          <CustomInput 
            placeholder="name@cdrmd.gov.ph" 
            value={email} onChangeText={setEmail} 
            icon={Mail} 
          />

          <View style={styles.row}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <CustomInput 
            placeholder="Enter your password" 
            secureTextEntry 
            value={password} onChangeText={setPassword} 
            icon={Lock} 
          />

          <PrimaryButton title="Access dashboard" icon={ArrowRight} onPress={() => login(email)} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ForgotPasswordScreen = ({ navigation }) => {
  return (
    <View style={styles.centerContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ArrowLeft color={COLORS.text} size={24} />
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={styles.cardLogoWrap}>
          <AppLogo size={56} />
        </View>
      </View>
      
      <Text style={[styles.title, { textAlign: 'center' }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 28 }]}>
        Enter your operator email to receive a secure reset link.
      </Text>
      
      <CustomInput placeholder="name@cdrmd.gov.ph" icon={Mail} />
      
      <PrimaryButton title="Send Reset Link" onPress={() => navigation.goBack()} />
    </View>
  );
};

const DashboardScreen = () => {
  const { 
    systemStatus, stations, simulateRain, resetNormal, logout,
    isEvacuating, triggerEvacuation, smsLogs, addLog, clearLogs
  } = useStore();

  const getStatusColor = (status) => {
    switch(status) {
      case 'ADVISORY': return COLORS.warning;
      case 'ALERT': return COLORS.danger; 
      case 'CRITICAL': return COLORS.danger;
      default: return COLORS.success;
    }
  };

  // Broadcast function simulating an API call/SMS gateway
  const handleBroadcast = () => {
    triggerEvacuation();
    clearLogs();
    
    const steps = [
      "Connecting to Telco Gateway (Globe/Smart)...",
      "Broadcasting SMS to Barangay Carmen (Zone 1-5)...",
      "Broadcasting SMS to Barangay Balulang...",
      "Broadcasting SMS to Barangay Lapasan...",
      "Activating Sirens at Ysalina Bridge...",
      "EVACUATION PROTOCOLS ACTIVE. STANDBY FOR UPDATES."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        addLog(`[${new Date().toLocaleTimeString()}] ${step}`);
      }, (index + 1) * 1000); // Adds a log every second
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container}>
        
        {/* ─── Dashboard Header ─── */}
        <View style={styles.dashHeader}>
          <View style={styles.dashHeaderLeft}>
            <View style={styles.dashLogoWrap}>
              <AppLogo size={32} />
            </View>
            <View>
              <Text style={styles.headerTitle}>CDO Flood Warning</Text>
              <Text style={styles.headerSub}>Telemetry Node v2.4</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout}>
            <Text style={{color: COLORS.danger, fontWeight: 'bold'}}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Threat Level ─── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Overall System Threat:</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(systemStatus) + '20', borderColor: getStatusColor(systemStatus) }]}>
            <ShieldCheck color={getStatusColor(systemStatus)} size={16} />
            <Text style={[styles.badgeText, { color: getStatusColor(systemStatus) }]}>
              {systemStatus} {systemStatus === 'ALERT' ? '(HIGH RISK)' : '(LOW RISK)'}
            </Text>
          </View>
        </View>

        {/* ─── EMERGENCY BROADCAST PANEL (Appears on ALERT) ─── */}
        {systemStatus === 'ALERT' && (
          <View style={[styles.card, styles.emergencyCard]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <AlertTriangle color={COLORS.danger} size={24} />
              <Text style={[styles.sectionTitle, { color: COLORS.danger, marginLeft: 8, marginBottom: 0 }]}>
                EMERGENCY BROADCAST REQUIRED
              </Text>
            </View>
            
            <Text style={styles.emergencyText}>
              Severe rainfall detected. Water levels are rising rapidly. You have the authority to activate Barangay Evacuation Protocols.
            </Text>

            {!isEvacuating ? (
              <TouchableOpacity style={styles.broadcastBtn} onPress={handleBroadcast}>
                <Send color={COLORS.text} size={20} />
                <Text style={styles.broadcastBtnText}>Send SMS & Siren Alert</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeBroadcast}>
                <Text style={[styles.broadcastBtnText, { color: COLORS.success, marginBottom: 12 }]}>
                  ✅ BROADCAST SENT
                </Text>
                
                {/* Terminal Output Log */}
                <View style={styles.terminal}>
                  {smsLogs.map((log, i) => (
                    <Text key={i} style={styles.terminalText}>{log}</Text>
                  ))}
                </View>

                <TouchableOpacity style={styles.resolveBtn} onPress={resetNormal}>
                  <RotateCcw color={COLORS.textMuted} size={16} style={{ marginRight: 8 }} />
                  <Text style={{ color: COLORS.textMuted, fontWeight: 'bold' }}>Resolve Incident / Reset</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ─── Simulation Controls ─── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SIMULATION CONTROLS</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.simBtn} onPress={simulateRain}>
              <CloudRain color={COLORS.text} size={20} />
              <Text style={styles.btnText}>Simulate Rain</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.simBtn, styles.resetBtn]} onPress={resetNormal}>
              <RotateCcw color={COLORS.text} size={20} />
              <Text style={styles.btnText}>Reset Normal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>WATER LEVEL TELEMETRY</Text>
        
        {stations.map((station) => (
          <View key={station.id} style={styles.stationCard}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Waves color={COLORS.primaryLight} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.stationName}>{station.name}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusColor(station.status) + '20', borderColor: 'transparent' }]}>
                 <Text style={{ color: getStatusColor(station.status), fontSize: 12, fontWeight: 'bold' }}>{station.status}</Text>
              </View>
            </View>

            <View style={styles.dataRow}>
               <View><Text style={styles.dataLabel}>CURRENT</Text><Text style={styles.dataValue}>{station.current.toFixed(2)}m</Text></View>
               <View><Text style={styles.dataLabel}>BASELINE</Text><Text style={styles.dataValue}>{station.baseline.toFixed(2)}m</Text></View>
               <View><Text style={styles.dataLabel}>TOTAL RISE</Text><Text style={[styles.dataValue, { color: station.rise > 0 ? COLORS.danger : COLORS.success }]}>+{station.rise.toFixed(2)}m</Text></View>
            </View>

            <View style={{ marginTop: 16 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.dataLabel}>Channel Capacity Fill</Text>
                <Text style={styles.dataLabel}>{station.capacity}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.min(station.capacity, 100)}%`, backgroundColor: getStatusColor(station.status) }]} />
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// 6. NAVIGATION & APP ENTRY
// ==========================================
const Stack = createNativeStackNavigator();

export default function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==========================================
// 7. STYLES
// ==========================================
const styles = StyleSheet.create({
  // ---- Loading / Splash ----
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  splashLogoWrap: {
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: '#0d1522',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  splashTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', letterSpacing: 4 },
  splashSubtitle: { color: COLORS.primaryLight, fontSize: 11, letterSpacing: 2, marginTop: 8, fontWeight: '600' },
  splashFooter: { position: 'absolute', bottom: 40, color: COLORS.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  loadingText: { color: COLORS.textMuted, marginTop: 12, fontSize: 12, textAlign: 'center', letterSpacing: 1 },

  // ---- Shared ----
  centerContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: SIZES.padding },
  scrollContainer: { flexGrow: 1, backgroundColor: COLORS.background, padding: SIZES.padding, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { color: COLORS.text, fontSize: 30, fontWeight: '800', lineHeight: 38, marginBottom: 16 },
  subtitle: { color: COLORS.textMuted, fontSize: 15, lineHeight: 22 },
  formCard: { backgroundColor: COLORS.surface, padding: 24, paddingTop: 56, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
  cardLogoWrap: { width: 88, height: 88, borderRadius: 24, backgroundColor: '#0d1522', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  formTitle: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  formSub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 24 },
  label: { color: COLORS.textMuted, fontSize: 14, marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '600' },
  backBtn: { position: 'absolute', top: 60, left: SIZES.padding },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderColor: COLORS.border, borderWidth: 1, borderRadius: SIZES.radius, marginBottom: 16, paddingHorizontal: 12 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.text, paddingVertical: 14, fontSize: 16 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: SIZES.radius, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },

  // ---- Dashboard ----
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding },
  dashHeader: { marginTop: 20, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dashHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dashLogoWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#0d1522', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: SIZES.radius, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  cardLabel: { color: COLORS.textMuted, fontSize: 14, marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  simBtn: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  resetBtn: { backgroundColor: COLORS.surfaceLight },
  btnText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  stationCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: SIZES.radius, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  stationName: { color: COLORS.text, fontSize: 15, fontWeight: 'bold' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, backgroundColor: COLORS.background, padding: 12, borderRadius: 8 },
  dataLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  dataValue: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  progressBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginTop: 8 },
  progressFill: { height: 6, borderRadius: 3 },

  // ---- EMERGENCY BROADCAST STYLES ----
  emergencyCard: {
    borderColor: COLORS.danger,
    borderWidth: 1.5,
    backgroundColor: '#1a0f14', // Slight dark red tint
  },
  emergencyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  broadcastBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  broadcastBtnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  activeBroadcast: {
    marginTop: 8,
  },
  terminal: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  terminalText: {
    color: COLORS.success,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    marginBottom: 4,
  },
  resolveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  }
});