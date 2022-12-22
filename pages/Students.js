import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  StatusBar,
  ScrollView,
  Modal,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { ListItem } from "@rneui/themed";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export default function Students() {
  const [students, setStudents] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionTriggered, setActionTriggered] = useState("");
  const [data, setData] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [index, setIndex] = useState("");

  const [key, setKey] = useState("");

  const getStudents = async () => {
    try {
      const {
        data: { students },
      } = await axios.get(`${global.ipAddress}/students`);
      setStudents(students);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(() => {
    if (global.student === 0 || global.student === 1) {
      getStudents();
      console.log("useFocusStudent: " + global.student);
      global.student = 2;
    } else {
      console.log("end_student");
      return;
    }
  });

  const showInformation = async (id) => {
    let data = "";

    try {
      const {
        data: { studentSubject },
      } = await axios.get(`${global.ipAddress}/studentSubjects/${id}&`);
      const { firstName, lastName, index } = students.find(
        (student) => student._id === id
      );
      let sum = 0;
      if (studentSubject.length == 0)
        data = `Student ${firstName} ${lastName} sa brojem indeksa ${index} nema predmeta koje slusa.`;
      else {
        data = `Student ${firstName} ${lastName} sa brojem indeksa ${index} slusa sledece predmete:\n\n`;
        for (let i = 0; i < studentSubject.length; i++) {
          sum = 0;
          const {
            data: { subject },
          } = await axios.get(
            `${global.ipAddress}/subjects/${studentSubject[i].subject_id}`
          );
          data += `\t\t- ${subject.name} (${studentSubject[i].school_year})\n\n`;
          for (let j = 0; j < subject.categories.length; j++) {
            let tmp1 =
              studentSubject[i].points[j] === undefined
                ? 0
                : studentSubject[i].points[j];
            sum += Number(tmp1);
            data += `\t\t\t\t\t- ${subject.categories[j]} - ${tmp1} poen/a\n\n`;
          }
          data += `\t\tUkupan broj poena - ${sum}\n\n\n`;
        }
      }
    } catch (error) {
      console.log(error);
    }

    setData(data);
  };

  const updateStudent = async () => {
    try {
      const {
        data: { student },
      } = await axios.patch(`${global.ipAddress}/students/${key}`, {
        firstName,
        lastName,
        index,
      });

      global.student = 1;
      getStudents();

      Alert.alert("Uspesno", "Student je uspesno azuriran.");
    } catch (error) {
      let msg = "";
      if (firstName === "")
        msg += error.response.data.msg.errors.firstName.message + "\n";

      if (lastName === "")
        msg += error.response.data.msg.errors.lastName.message + "\n";

      if (index === "")
        msg += error.response.data.msg.errors.index.message + "\n";

      if (index !== "" && error.response.data.msg.errors.index !== undefined)
        msg += error.response.data.msg.errors.index.message + "\n";

      Alert.alert("Greska", msg);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`${global.ipAddress}/studentSubjects/${id}&`);
      await axios.delete(`${global.ipAddress}/students/${id}`);
      global.student = 1;
      getStudents();
    } catch (error) {
      console.log(error);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(10).then(() => {
      global.student = 1;
      setRefreshing(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Modal visible={modalOpen} animationType="slide">
        <View>
          <MaterialIcons
            name="close"
            size={28}
            onPress={() => setModalOpen(false)}
            style={styles.modalClose}
          />
          <ScrollView>
            {actionTriggered === "ACTION_1" ? (
              <View>
                <Text style={{ marginLeft: 12, marginTop: 10, fontSize: 16 }}>
                  Ime
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(firstName) => setFirstName(firstName)}
                  value={firstName}
                />

                <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
                  Prezime
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(lastName) => setLastName(lastName)}
                  value={lastName}
                />

                <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
                  Broj indeksa
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(index) => setIndex(index)}
                  value={index}
                />

                <View
                  style={{ width: "45%", marginTop: 40, alignSelf: "center" }}
                >
                  <Button title="Azuriraj studenta" onPress={updateStudent} />
                </View>
              </View>
            ) : actionTriggered === "ACTION_2" ? (
              <Text style={{ fontSize: 20 }}>{data}</Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
      {/*<Button title="Ucitaj studente" color="green" onPress={getStudents} />*/}
      {students && students.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {students.map((student) => (
            <ListItem.Swipeable
              key={student._id}
              onPress={() => {
                setModalOpen(true),
                  showInformation(student._id),
                  setActionTriggered("ACTION_2");
              }}
              bottomDivider
              leftContent={() => (
                <Button
                  title="Azuriraj"
                  onPress={() => {
                    setModalOpen(true),
                      setActionTriggered("ACTION_1"),
                      setKey(student._id);
                    setFirstName(
                      students.find((s) => s._id === student._id).firstName
                    );
                    setLastName(
                      students.find((s) => s._id === student._id).lastName
                    );
                    setIndex(students.find((s) => s._id === student._id).index);
                  }}
                  color="blue"
                />
              )}
              rightContent={() => (
                <Button
                  title="Izbrisi"
                  onPress={() => {
                    deleteStudent(student._id);
                  }}
                  color="red"
                />
              )}
            >
              <ListItem.Content>
                <ListItem.Title>
                  {student.firstName} {student.lastName}
                </ListItem.Title>
                <ListItem.Subtitle>{student.index}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem.Swipeable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ced6d2",
  },
  modalClose: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "black",
    padding: 5,
    borderRadius: 10,
    alignSelf: "center",
  },
  input: {
    height: 40,
    marginLeft: 12,
    marginTop: 7,
    marginRight: 12,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: "black",
    padding: 10,
  },
});
