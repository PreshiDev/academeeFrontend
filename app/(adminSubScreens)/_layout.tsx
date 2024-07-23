import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const SubScreenLayout = () => {

  return (
    <>
      <Stack>
        <Stack.Screen
          name="AdminSchoolCalendars"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminDays"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminEnote"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminClassNote"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminAssemblyTopics"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminExamQuestions"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminExamTimetable"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminReportComments"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminSchoolActivities"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminSheetTemplates"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminWorkBook"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      
      <StatusBar backgroundColor="#D3D3D3" />
    </>
  );
};

export default SubScreenLayout;