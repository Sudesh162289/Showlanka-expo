// App.js – ShowLanka (all-in-one, production-ready demo)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, TextInput, FlatList,
  StyleSheet, ActivityIndicator, RefreshControl, Alert, Share, Image,
  Modal, Pressable, Platform, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking } from 'react-native';

// ================== THEME ==================
const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B0B0F',
    card: '#0B0B0F',
    text: '#fff',
    border: '#15161A',
    primary: '#8B5CF6',
  },
};

// ================== HELPERS ==================
const uid = () => 'e-' + Math.random().toString(36).slice(2, 9);
const safeParse = (str, fallback) => { try { const v = JSON.parse(str); return v ?? fallback; } catch { return fallback; } };
const telUrl = (raw) => `tel:${(raw || '').replace(/\s+/g, '')}`;
const openTel = async (raw) => { const url = telUrl(raw); const ok = await Linking.canOpenURL(url); if (!ok) return Alert.alert('Cannot call', 'Phone action failed.'); return Linking.openURL(url); };
const openMapsSearch = async (query) => { const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; const ok = await Linking.canOpenURL(url); if (!ok) return Alert.alert('Error', 'Cannot open maps'); return Linking.openURL(url); };

// ================== DATA ==================
const SEED_EVENTS = [
  { id: 'e-001', title: 'Night Groove', district: 'Kandy', date: '2025-04-26', time: '08:00 PM', type: 'Live Band', phone: '011 2345678', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1887&auto=format&fit=crop' },
  { id: 'e-002', title: 'Vesak Festival', district: 'Colombo', date: '2025-04-24', time: '07:00 PM', type: 'Festival', phone: '011 5566778', image: 'https://images.unsplash.com/photo-1568485248685-566c33cc3e9e?q=80&w=1887&auto=format&fit=crop' },
  { id: 'e-003', title: 'Traditional Music Concert', district: 'Galle', date: '2025-05-02', time: '06:30 PM', type: 'Classical', phone: '091 2233445', image: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1887&auto=format&fit=crop' },
];
const DISTRICTS = ['All Districts', 'Colombo', 'Kandy', 'Galle', 'Negombo', 'Matara'];
const DATE_FILTERS = ['All', 'Today', 'This Weekend', 'Upcoming'];
const TYPES = ['All Types', 'Live Band', 'DJ', 'Festival', 'Classical'];
const STORAGE_KEYS = { events: '@showlanka_events_v1', favs: '@showlanka_favs_v1' };

// ================== COMPONENTS ==================
const Pill = ({ label, onPress }) => (
  <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.pillText}>{label}</Text>
    <Ionicons name="chevron-down" size={16} color="#0B0B0F" style={{ marginLeft: 6 }} />
  </TouchableOpacity>
);

const Dropdown = ({ visible, onClose, options, onSelect, title }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.modalBackdrop} onPress={onClose}>
      <View style={styles.modalSheet}>
        <Text style={styles.modalTitle}>{title}</Text>
        {options.map((opt) => (
          <Pressable key={opt} onPress={() => { onSelect(opt); onClose(); }} style={styles.modalItem}>
            <Text style={styles.modalItemText}>{opt}</Text>
          </Pressable>
        ))}
      </View>
    </Pressable>
  </Modal>
);

const CardSkeleton = () => (
  <View style={[styles.card, { opacity: 0.6 }]}>
    <View style={{ height: 180, backgroundColor: '#e5e7eb' }} />
    <View style={{ height: 12 }} />
    <View style={{ height: 18, backgroundColor: '#e5e7eb', marginHorizontal: 14, borderRadius: 6 }} />
    <View style={{ height: 10 }} />
    <View style={{ height: 12, backgroundColor: '#e5e7eb', marginHorizontal: 14, borderRadius: 6, width: 140 }} />
    <View style={{ height: 14 }} />
  </View>
);

const EventCard = ({ item, isFav, onPress, onCall, onShare, onToggleFav }) => {
  const img = item?.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/800x400.png?text=Event' };
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <Image source={img} style={styles.cardImage} resizeMode="cover" />
      <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={18} color="#6B7280" />
          <Text style={styles.metaText}>{item.district}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <Text style={styles.metaText}>{item.date}{item.time ? `, ${item.time}` : ''}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={onCall} style={styles.iconBtn}><Ionicons name="call-outline" size={18} color="#0B0B0F" /></TouchableOpacity>
            <TouchableOpacity onPress={onShare} style={styles.iconBtn}><Ionicons name="share-social-outline" size={18} color="#0B0B0F" /></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onToggleFav} style={styles.iconBtn}><Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#ef4444' : '#0B0B0F'} /></TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ================== SCREENS ==================
const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loadingSeed, setLoadingSeed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [district, setDistrict] = useState('All Districts');
  const [dateFilter, setDateFilter] = useState('All');
  const [type, setType] = useState('All Types');
  const [q, setQ] = useState('');
  const debounceRef = useRef();
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [form, setForm] = useState({ title:'', district:'Colombo', date:'', time:'', type:'Live Band', phone:'', image:'' });

  useEffect(() => {
    (async () => {
      try {
        const stored = safeParse(await AsyncStorage.getItem(STORAGE_KEYS.events), null);
        const favs = safeParse(await AsyncStorage.getItem(STORAGE_KEYS.favs), {});
        if (stored?.length) setEvents(stored); else { setEvents(SEED_EVENTS); await AsyncStorage.setItem(STORAGE_KEYS.events, JSON.stringify(SEED_EVENTS)); }
        setFavorites(favs || {});
      } catch (e) { console.log('load error', e); } finally { setTimeout(() => setLoadingSeed(false), 500); }
    })();
  }, []);

  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events)).catch(()=>{}); }, [events]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.favs, JSON.stringify(favorites)).catch(()=>{}); }, [favorites]);

  const onRefresh = async () => { setRefreshing(true); setTimeout(()=>{setRefreshing(false); Alert.alert('Refreshed','Events list updated (demo).');},800); };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return events.filter(e => {
      const matchQ = !term || e.title?.toLowerCase().includes(term) || e.district?.toLowerCase().includes(term);
      const matchDistrict = district === 'All Districts' || e.district === district;
      const matchType = type === 'All Types' || e.type === type;
      const matchDate = ['All', 'Today', 'This Weekend', 'Upcoming'].includes(dateFilter);
      return matchQ && matchDistrict && matchType && matchDate;
    });
  }, [events,q,district,type,dateFilter]);

  const toggleFav = (id) => setFavorites(prev => { const next = {...prev}; if(next[id]) delete next[id]; else next[id]=true; return next; });
  const openDetails = (evt) => navigation.navigate('Details',{ event:evt, isFav:!!favorites[evt.id] });
  const submitAdd = () => { if(!form.title || !form.date){Alert.alert('Missing fields','Please enter at least Title and Date.'); return;} const newEvt={...form,id:uid()}; setEvents(prev=>[newEvt,...prev]); setForm({ title:'', district:'Colombo', date:'', time:'', type:'Live Band', phone:'', image:'' }); setOpenAdd(false); Alert.alert('Event added','Your event was added (demo).'); };
  const doShare = async(evt)=>{try{await Share.share({message:`${evt.title} — ${evt.district} • ${evt.date}${evt.time?' '+evt.time:''}\nContact: ${evt.phone}\nvia ShowLanka`});}catch(e){console.log(e);}};

  const onChangeSearch=(t)=>{if(debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current=setTimeout(()=>setQ(t),120);}
  const renderItem = ({item}) => (<EventCard item={item} isFav={!!favorites[item.id]} onPress={()=>openDetails(item)} onCall={()=>openTel(item.phone)} onShare={()=>doShare(item)} onToggleFav={()=>toggleFav(item.id)}/>);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={Platform.OS==='ios'?'light-content':'light-content'} backgroundColor="#0B0B0F"/>
      <View style={styles.header}>
        <Text style={styles.brand}>ShowLanka</Text>
        <TouchableOpacity style={styles.addBtn} onPress={()=>setOpenAdd(true)} activeOpacity={0.9}><Text style={styles.addBtnText}>+ Add Event</Text></TouchableOpacity>
      </View>
      <View style={styles.pillsRow}><Pill label={district} onPress={()=>setOpenDistrict(true)}/><Pill label={dateFilter} onPress={()=>setOpenDate(true)}/><Pill label={type} onPress={()=>setOpenType(true)}/></View>
      <View style={styles.searchBox}><Ionicons name="search" size={18} color="#9CA3AF"/><TextInput placeholder="Search for artist or place" placeholderTextColor="#9CA3AF" onChangeText={onChangeSearch} style={styles.searchInput} autoCorrect={false} autoCapitalize="none" returnKeyType="search"/></View>

      {loadingSeed?(<View style={{paddingHorizontal:16}}><CardSkeleton/><CardSkeleton/></View>):(
        <FlatList data={filtered} keyExtractor={it=>it.id} renderItem={renderItem} contentContainerStyle={{paddingBottom:32,paddingTop:8}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} ListEmptyComponent={<View style={{padding:24}}><Text style={{color:'#9CA3AF'}}>No events found.</Text></View>} removeClippedSubviews initialNumToRender={6} windowSize={10} maxToRenderPerBatch={8}/>
      )}

      <Dropdown visible={openDistrict} onClose={()=>setOpenDistrict(false)} options={DISTRICTS} onSelect={setDistrict} title="Select District"/>
      <Dropdown visible={openDate} onClose={()=>setOpenDate(false)} options={DATE_FILTERS} onSelect={setDateFilter} title="Select Date"/>
      <Dropdown visible={openType} onClose={()=>setOpenType(false)} options={TYPES} onSelect={setType} title="Select Type"/>

      {openAdd && (
        <View style={styles.addSheet}>
          <Text style={{fontSize:18,fontWeight:'800',color:'#fff'}}>Add Event (demo)</Text>
          {['title','district','date','time','type','phone','image'].map(k=>(
            <TextInput key={k} placeholder={k.charAt(0).toUpperCase()+k.slice(1)} placeholderTextColor="#9CA3AF" value={form[k]} onChangeText={t=>setForm(f=>({...f,[k]:t}))} style={styles.input}/>
          ))}
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:12}}>
            <TouchableOpacity style={styles.modalBtn} onPress={()=>setOpenAdd(false)}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn,{backgroundColor:'#8B5CF6'}]} onPress={submitAdd}><Text style={[styles.modalBtnText,{color:'#fff'}]}>Add</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const DetailsScreen = ({ route }) => {
  const evt = route?.params?.event; if(!evt) return null;
  const img = evt.image ? { uri: evt.image } : { uri: 'https://via.placeholder.com/800x400.png?text=Event' };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <Image source={img} style={{width:'100%',height:300,backgroundColor:'#e5e7eb'}}/>
        <View style={{padding:16}}>
          <Text style={{fontSize:26,fontWeight:'800',color:'#fff'}}>{evt.title}</Text>
          <Text style={{color:'#9CA3AF',marginTop:6}}>{evt.type} • {evt.district}</Text>
          <Text style={{color:'#9CA3AF',marginTop:6}}>{evt.date}{evt.time?` • ${evt.time}`:''}</Text>
          <View style={{height:12}}/>
          <Text style={{color:'#e5e7eb'}}>{evt.description||'No description provided (demo).'}</Text>
          <View style={{height:18}}/>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.actionBtn} onPress={()=>openMapsSearch(`${evt.district} ${evt.title}`)}><Ionicons name="navigate-outline" size={20} color="#0B0B0F"/><Text style={styles.actionBtnText}>Open Map</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={()=>openTel(evt.phone)}><Ionicons name="call-outline" size={20} color="#0B0B0F"/><Text style={styles.actionBtnText}>Call</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer theme={MyTheme||DarkTheme}>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Details" component={DetailsScreen} options={{headerShown:true,title:'Event Details',headerStyle:{backgroundColor:'#0B0B0F'},headerTintColor:'#fff'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ================== STYLES ==================
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#0B0B0F'},header:{paddingHorizontal:16,paddingTop:8,paddingBottom:12,backgroundColor:'#0B0B0F'},brand:{fontSize:28,fontWeight:'900',color:'#fff'},addBtn:{marginTop:12,backgroundColor:'#fff',borderRadius:14,paddingVertical:12,alignItems:'center'},addBtnText:{color:'#0B0B0F',fontWeight:'700'},
  pillsRow:{flexDirection:'row',gap:10,paddingHorizontal:16,marginTop:12},
  searchBox:{marginTop:12,marginHorizontal:16,flexDirection:'row',alignItems:'center',backgroundColor:'#fff