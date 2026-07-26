import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useWallet } from "../../context/WalletContext";
import { TRANSACTION_FILTERS } from "../../data/mockProfile";
import WalletBalanceCard from "../../components/account/WalletBalanceCard";
import TransactionRow from "../../components/account/TransactionRow";
import TopUpModal from "../../components/account/TopUpModal";
import { showDevMessage } from "../../utils/devFeedback";

export default function MyWalletScreen({ navigation }) {
  const { balance, transactions, balanceUpdated, topUp } = useWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Transaction");
  const [topUpVisible, setTopUpVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("1000");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesFilter =
        activeFilter === "All Transaction" || tx.type === activeFilter;
      const matchesSearch =
        !search.trim() ||
        tx.label.toLowerCase().includes(search.toLowerCase()) ||
        tx.type.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, activeFilter, search]);

  const handleTopUpConfirm = () => {
    topUp(topUpAmount);
    setTopUpVisible(false);
    showDevMessage("Top Up", `Rechargement de ${topUpAmount} Da effectué.`);
  };

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <WalletBalanceCard
            balance={balance}
            balanceVisible={balanceVisible}
            onToggleVisibility={() => setBalanceVisible((v) => !v)}
            updatedAt={balanceUpdated}
            onTransfer={() => showDevMessage("Transfer", "Transfert simulé.")}
            onTopUp={() => setTopUpVisible(true)}
          />

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Transaction History</Text>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                placeholderTextColor={colors.placeholder}
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons name="options-outline" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {TRANSACTION_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[
                    styles.filterChip,
                    activeFilter === filter && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.list}>
              {filtered.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
              {filtered.length === 0 ? (
                <Text style={styles.empty}>Aucune transaction trouvée.</Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <TopUpModal
        visible={topUpVisible}
        amount={topUpAmount}
        onChangeAmount={setTopUpAmount}
        onClose={() => setTopUpVisible(false)}
        onConfirm={handleTopUpConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  topSafe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  headerSpacer: { width: 40 },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 500,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textHeading,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    gap: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterChipActive: {
    borderBottomColor: colors.navy,
  },
  filterText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.textHeading,
    fontWeight: "600",
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: colors.textMuted,
  },
});
