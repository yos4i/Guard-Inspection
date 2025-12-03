import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGuards, useSortedGuards } from '@/contexts/GuardsProvider';
import { UserCircle, Plus, Trash2, ClipboardList } from 'lucide-react-native';

export default function GuardsScreen() {
  const router = useRouter();
  const { deleteGuard, isLoading, getDaysUntilNextInspection } = useGuards();
  const guards = useSortedGuards();

  const handleDelete = (guardId: string, name: string) => {
    Alert.alert(
      'מחיקת בקרה',
      `האם אתה בטוח שברצונך למחוק את ${name}?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => deleteGuard(guardId),
        },
      ]
    );
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return '#DC2626';
    if (days <= 7) return '#F59E0B';
    return '#10B981';
  };

  const getStatusText = (days: number) => {
    if (days < 0) return `איחור ${Math.abs(days)} ימים`;
    if (days === 0) return 'היום';
    return `עוד ${days} ימים`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'בקרה',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/add-guard')}
              style={styles.addButton}
            >
              <Plus size={24} color="#2563EB" />
            </TouchableOpacity>
          ),
        }}
      />

      {guards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <UserCircle size={80} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>אין בקרות במערכת</Text>
          <Text style={styles.emptyText}>הוסף בקרה ראשונה על ידי לחיצה על כפתור +</Text>
        </View>
      ) : (
        <FlatList
          data={guards}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const daysUntilNext = getDaysUntilNextInspection(item.id);
            const statusColor = getStatusColor(daysUntilNext);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.guardInfo}>
                    <View style={styles.iconContainer}>
                      <UserCircle size={40} color="#2563EB" strokeWidth={1.5} />
                    </View>
                    <View style={styles.guardDetails}>
                      <Text style={styles.guardName}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={styles.guardId}>ת.ז: {item.idNumber}</Text>
                      <Text style={styles.guardPhone}>טלפון: {item.phone}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, `${item.firstName} ${item.lastName}`)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>

                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {getStatusText(daysUntilNext)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.inspectButton}
                    onPress={() => router.push(`/inspection?guardId=${item.id}`)}
                  >
                    <ClipboardList size={18} color="#FFFFFF" />
                    <Text style={styles.inspectButtonText}>בקרה חדשה</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.historyButton}
                  onPress={() => router.push(`/history?guardId=${item.id}`)}
                >
                  <Text style={styles.historyButtonText}>היסטוריית בקרות</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {guards.length > 0 && guards.length >= 25 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            הגעת למגבלת {guards.length}/30 בקרות
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guardInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    marginLeft: 12,
  },
  guardDetails: {
    flex: 1,
  },
  guardName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  guardId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  guardPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  inspectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  inspectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  historyButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F59E0B',
  },
  warningText: {
    color: '#92400E',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
