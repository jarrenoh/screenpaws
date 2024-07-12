import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../screens/RegisterScreen';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/core';

jest.mock('@react-navigation/core', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  },
  firestore: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
  },
}));

const mockedNavigate = jest.fn();
const mockedReplace = jest.fn();

describe('RegisterScreen', () => {
  beforeAll(() => {
    useNavigation.mockReturnValue({
      navigate: mockedNavigate,
      replace: mockedReplace,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('handles sign up with existing username', async () => {
    firestore.get.mockResolvedValueOnce({
      empty: false,
    });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'existinguser');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(firestore.get).toHaveBeenCalled();
      expect(auth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  it('handles sign up with new username', async () => {
    firestore.get.mockResolvedValueOnce({
      empty: true,
    });

    auth.createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: '123',
        email: 'test@test.com',
        updateProfile: jest.fn().mockResolvedValueOnce({}),
      },
    });

    firestore.set.mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'newuser');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(firestore.get).toHaveBeenCalled();
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith('test@test.com', 'password');
      expect(firestore.set).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'test@test.com',
      });
      expect(mockedReplace).toHaveBeenCalledWith('Home');
    });
  });
});
