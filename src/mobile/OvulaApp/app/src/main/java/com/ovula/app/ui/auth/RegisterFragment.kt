package com.ovula.app.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.ovula.app.R
import com.ovula.app.data.api.RetrofitClient
import com.ovula.app.data.model.RegisterRequest
import com.ovula.app.databinding.FragmentRegisterBinding
import kotlinx.coroutines.launch

class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnRegister.setOnClickListener { handleRegister() }
        binding.tvLogin.setOnClickListener { findNavController().navigateUp() }
    }

    private fun handleRegister() {
        val name = binding.etName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()
        val confirmPassword = binding.etConfirmPassword.text.toString().trim()

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            Toast.makeText(requireContext(), "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }
        if (password != confirmPassword) {
            Toast.makeText(requireContext(), "Passwords do not match", Toast.LENGTH_SHORT).show()
            return
        }
        if (password.length < 6) {
            Toast.makeText(requireContext(), "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
            return
        }

        setLoading(true)
        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(requireContext())
                val response = api.register(RegisterRequest(name, email, password))

                if (response.isSuccessful) {
                    Toast.makeText(requireContext(), "Account created! Please verify your email.", Toast.LENGTH_LONG).show()
                    val bundle = Bundle().apply { putString("email", email) }
                    findNavController().navigate(R.id.action_register_to_verify, bundle)
                } else {
                    val errBody = response.errorBody()?.string() ?: ""
                    when {
                        errBody.contains("already registered") ->
                            Toast.makeText(requireContext(), "Email already registered. Try logging in.", Toast.LENGTH_SHORT).show()
                        else ->
                            Toast.makeText(requireContext(), "Registration failed. Please try again.", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.btnRegister.isEnabled = !loading
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        binding.btnRegister.text = if (loading) "" else "Create Account"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
