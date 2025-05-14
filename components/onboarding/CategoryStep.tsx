import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CategoryStep = ({ onNext }: { onNext: () => void }) => {
  const [incomeTags, setIncomeTags] = useState<string[]>([]);
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  const [incomeInput, setIncomeInput] = useState('');
  const [expenseInput, setExpenseInput] = useState('');

  const addIncomeTag = () => {
    if (incomeInput.trim()) {
      setIncomeTags([...incomeTags, incomeInput.trim()]);
      setIncomeInput('');
    }
  };

  const addExpenseTag = () => {
    if (expenseInput.trim()) {
      setExpenseTags([...expenseTags, expenseInput.trim()]);
      setExpenseInput('');
    }
  };

  const removeTag = (type: 'income' | 'expense', index: number) => {
    if (type === 'income') {
      setIncomeTags(incomeTags.filter((_, i) => i !== index));
    } else {
      setExpenseTags(expenseTags.filter((_, i) => i !== index));
    }
  };

  const renderTags = (tags: string[], type: 'income' | 'expense') => (
    <View style={styles.tagContainer}>
      {tags.map((tag, index) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
          <TouchableOpacity onPress={() => removeTag(type, index)}>
            <AntDesign name="close" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.wrapper}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.topSection}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Category Setup</Text>

          {/* Income */}
          <Text style={styles.labelText}>Income Categories</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Salary"
              value={incomeInput}
              onChangeText={setIncomeInput}
              placeholderTextColor="#6b7280"
            />
            <TouchableOpacity onPress={addIncomeTag} style={styles.addButton}>
              <AntDesign name="plus" size={24} color="#26897C" />
            </TouchableOpacity>
          </View>
          {renderTags(incomeTags, 'income')}

          {/* Expense */}
          <Text style={[styles.labelText, { marginTop: 20 }]}>Expense Categories</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rent"
              value={expenseInput}
              onChangeText={setExpenseInput}
              placeholderTextColor="#6b7280"
            />
            <TouchableOpacity onPress={addExpenseTag} style={styles.addButton}>
              <AntDesign name="plus" size={24} color="#26897C" />
            </TouchableOpacity>
          </View>
          {renderTags(expenseTags, 'expense')}
        </ScrollView>


        <View style={styles.bottomSection}>

          <View style={styles.stepperContainer}>
            {Array.from({ length: 5 }).map((_, index) => {
              const isActive = index + 1 === 5;
              return (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>

          <TouchableOpacity  style={styles.button}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

export default CategoryStep;

// styles remain the same as before
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  topSection: {
    padding: 24,
    flexGrow: 1,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginBottom : 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#26897C',
    marginBottom: 24,
  },
  labelText: {
    color: '#4b5563',
    fontSize: 16,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
    borderColor: '#e5e7eb',
    color: '#000000',
  },
  addButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e0f2f1',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 6,
    fontSize: 14,
    color: '#111',
  },
  button: {
    backgroundColor: '#26897C',
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 21,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6b7280',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },
});
