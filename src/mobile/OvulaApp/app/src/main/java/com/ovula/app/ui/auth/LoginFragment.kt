package com.ovula.app.ui.auth

import android.content.Intent
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
import com.ovula.app.data.model.LoginRequest
import com.ovula.app.databinding.FragmentLoginBinding
import com.ovula.app.ui.main.MainActivity
import com.ovula.app.utils.TokenManager
import kotlinx.coroutines.launch

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!
    private lateinit var tokenManager: TokenManager

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        tokenManager = TokenManager(requireContext())

        binding.btnLogin.setOnClickListener { handleLogin() }
        binding.tvRegister.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_register)
        }

        // Toggle password visibility
        binding.btnTogglePassword.setOnClickListener {
            togglePasswordVisibility()
        }
    }

    private fun togglePasswordVisibility() {
        val et = binding.etPassword
        val isVisible = et.inputType == android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
        et.inputType = if (isVisible) {
            android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        } else {
            android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
        }
        et.setSelection(et.text?.length ?: 0)
        binding.btnTogglePassword.setImageResource(
            if (isVisible) R.drawable.ic_eye else R.drawable.ic_eye_off
        )
    }

    private fun handleLogin() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(requireContext(), "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        setLoading(true)
        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(requireContext())
                val response = api.login(LoginRequest(email, password))

                if (response.isSuccessful) {
                    val token = response.body()?.accessToken ?: ""
                    tokenManager.saveToken(token)
                    RetrofitClient.reset() // Reinitialize with token

                    // Fetch user info
                    val userResp = RetrofitClient.getApiService(requireContext()).getMe()
                    if (userResp.isSuccessful) {
                        val user = userResp.body()!!
                        tokenManager.saveUserInfo(user.email, user.name)
                    }

                    startActivity(Intent(requireContext(), MainActivity::class.java))
                    requireActivity().finish()
                } else {
                    val errBody = response.errorBody()?.string() ?: ""
                    when {
                        errBody.contains("EMAIL_NOT_VERIFIED") -> {
                            val bundle = Bundle().apply { putString("email", email) }
                            findNavController().navigate(R.id.action_login_to_verify, bundle)
                        }
                        errBody.contains("Incorrect email or password") ->
                            Toast.makeText(requireContext(), "Wrong email or password", Toast.LENGTH_SHORT).show()
                        else ->
                            Toast.makeText(requireContext(), "Login failed. Try again.", Toast.LENGTH_SHORT).show()
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
        binding.btnLogin.isEnabled = !loading
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        binding.btnLogin.text = if (loading) "" else "Log In"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
