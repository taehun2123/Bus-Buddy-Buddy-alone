import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

import Footer from '../components/Footer';
import useSelectedStationStore from '../store/useSelectedStationStore';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  BusRoute: { busNumber: string };
};


const BusRoutePage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'BusRoute'>>();
  const [stationList, setStationList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedStation } = useSelectedStationStore();

  const busNumber = route.params.busNumber;

  useEffect(() => {
    fetchStationList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busNumber]);

  const fetchStationList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/bus/stationNames/${busNumber}`
      );
      setStationList(response.data.data);
      setError(null);
    } catch (error) {
      console.error('정류장 목록을 불러오는 중 오류 발생:', error);
      setError('정류장 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStationClick = async (stationName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/station?name=${stationName}`
      );
      const stationData = response.data.data[0]; // 첫 번째 결과만 사용
      setSelectedStation(stationData);
      navigation.navigate('Home' as never);
    } catch (error) {
      console.error('정류장 정보를 불러오는 중 오류 발생:', error);
    }
  };

  const renderStationItem = ({ item }: { item: string; index: number }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => handleStationClick(item)}
      activeOpacity={0.7}
    >
      <View style={styles.dot} />
      <Text style={styles.stationName}>{item}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#80CBC4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          <Text style={styles.busNumber}>{busNumber} 버스</Text>의 정류장
        </Text>
      </View>

      <FlatList
        data={stationList}
        renderItem={renderStationItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.stationList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#80CBC4',
    width: width - 32,
    height: 48,
    borderRadius: 10,
    marginVertical: 16,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  busNumber: {
    color: '#E3F2FD',
  },
  stationList: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  listContent: {
    paddingVertical: 8,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D0C9DF',
    backgroundColor: 'rgba(245, 249, 39, 0.1)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    marginRight: 10,
  },
  stationName: {
    fontSize: 16,
    color: '#333333',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});

export default BusRoutePage;