import { StyleSheet } from 'react-native';
import Colors from './Colors';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 16,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
    },
    button: {
        backgroundColor: Colors.accent,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    label: {
        fontSize: 16,
        color: Colors.secondary,
        marginBottom: 8,
    }
});
